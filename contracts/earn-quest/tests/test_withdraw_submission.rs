#![cfg(test)]

extern crate earn_quest;

use earn_quest::{EarnQuestContract, EarnQuestContractClient};
use soroban_sdk::{
    symbol_short,
    testutils::{Address as _, Events},
    Address, BytesN, Env, Symbol, IntoVal,
};

fn setup() -> (Env, EarnQuestContractClient<'static>, Address, Address, Address, Address, Symbol, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, EarnQuestContract);
    let client = EarnQuestContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    let creator = Address::generate(&env);
    let verifier = Address::generate(&env);
    let submitter = Address::generate(&env);
    let quest_id = symbol_short!("Qwd1");
    let asset = Address::generate(&env);

    client.register_quest(&quest_id, &creator, &asset, &100, &verifier, &10_000);

    (env, client, contract_id, creator, verifier, submitter, quest_id, asset)
}

#[test]
fn test_withdraw_rejected_emits_and_allows_resubmit() {
    let (env, client, contract_id, _creator, _verifier, submitter, quest_id, _asset) = setup();

    let proof_hash1 = BytesN::from_array(&env, &[1u8; 32]);
    client.submit_proof(&quest_id, &submitter, &proof_hash1);

    let res = client.try_withdraw_submission(&quest_id, &submitter);
    assert!(res.is_err());


    {
        use earn_quest::storage;
        use earn_quest::types::{SubmissionStatus, Submission};
        let mut s: Submission = env.as_contract(&contract_id, || storage::get_submission(&env, &quest_id, &submitter).unwrap());
        s.status = SubmissionStatus::Rejected;
        env.as_contract(&contract_id, || storage::set_submission(&env, &quest_id, &submitter, &s));
    }


    client.withdraw_submission(&quest_id, &submitter);

    let s = client.get_submission(&quest_id, &submitter);
    assert_eq!(s.status, earn_quest::SubmissionStatus::Withdrawn);

    let events = env.events().all();

    let (_contract, topics, _data) = events.last().unwrap();
    let event_name: soroban_sdk::Symbol = topics.get(0).unwrap().into_val(&env);
    assert_eq!(event_name, symbol_short!("sub_wd"));

    let proof_hash2 = BytesN::from_array(&env, &[9u8; 32]);
    client.submit_proof(&quest_id, &submitter, &proof_hash2);

    let s2 = client.get_submission(&quest_id, &submitter);
    assert_eq!(s2.status, earn_quest::SubmissionStatus::Pending);

}

#[test]
fn test_withdraw_rejected_deadline_edge_case() {
    use soroban_sdk::testutils::{Ledger, LedgerInfo};

    let (env, client, contract_id, _creator, _verifier, submitter, quest_id, _asset) = setup();

    // Create a submission and mark it rejected
    let proof_hash1 = BytesN::from_array(&env, &[2u8; 32]);
    client.submit_proof(&quest_id, &submitter, &proof_hash1);

    {
        use earn_quest::storage;
        use earn_quest::types::{SubmissionStatus, Submission};
        let mut s: Submission = env.as_contract(&contract_id, || storage::get_submission(&env, &quest_id, &submitter).unwrap());
        s.status = SubmissionStatus::Rejected;
        env.as_contract(&contract_id, || storage::set_submission(&env, &quest_id, &submitter, &s));
    }

    // Advance ledger time past the quest deadline
    env.ledger().set(LedgerInfo {
        protocol_version: 20,
        sequence_number: 2,
        timestamp: 20_000,
        network_id: Default::default(),
        base_reserve: 10,
        min_temp_entry_ttl: 100,
        min_persistent_entry_ttl: 100,
        max_entry_ttl: 1_000_000,
    });

    // Attempt to withdraw — should fail due to expired quest
    let res = client.try_withdraw_submission(&quest_id, &submitter);
    assert!(res.is_err());
}

