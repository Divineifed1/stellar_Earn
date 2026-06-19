## TODO: Withdraw rejected submissions + re-submit flow

- [x] Create branch `blackboxai/withdraw-rejected-submission`
- [x] Add `SubmissionStatus::Withdrawn`
- [x] Update submission status transition rules to allow `Rejected -> Withdrawn -> Pending`
- [x] Add `SubmissionWithdrawn` event publisher
- [ ] Implement `withdraw_submission` in `contracts/earn-quest/src/submission.rs`
- [ ] Add `withdraw_submission` entrypoint in `contracts/earn-quest/src/lib.rs`
- [ ] Update `commit_submission` and `submit_proof` to allow re-submission after withdrawal
- [ ] Add/adjust tests for withdraw + re-submit behavior
- [ ] Run `cargo test` for the contract crate and fix any compilation/test failures
## Notifications email/in-app templates (typed + tests)

- [ ] Implement `BackEnd/src/modules/notifications/template/notification.interface.ts` with typed data contracts + shared render result types.
- [ ] Implement `quest-update.template.ts` using `EmailTemplateEngine` for HTML rendering.
- [ ] Implement `submission-status.template.ts` using `EmailTemplateEngine` for HTML rendering.
- [ ] Implement `system.template.ts` using `EmailTemplateEngine` for HTML rendering.
- [ ] Add unit tests for all templates in `BackEnd/test/notifications/templates/notification.templates.spec.ts`.
- [ ] Run backend unit tests for the new suite and fix any TypeScript/Jest issues.
- [x] Create git branch `blackboxai/404-improvements`
- [ ] Redesign `FrontEnd/my-app/app/not-found.tsx`:

- [ ] Add friendly 404 illustration
- [ ] Add at least 2 navigation options (Home, Quest listing)
- [ ] Add inline search bar that queries quest search API
- [ ] Ensure accessible heading hierarchy (single H1)
- [ ] Add analytics tracking for 404 hits (event name + payload)
- [ ] Wire search results to quest listing links
- [ ] Run frontend lint/tests/build (as available)

