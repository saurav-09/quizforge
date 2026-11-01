# QuizForge Product Specification

## 1. Product overview
QuizForge is an assessment platform for instructors and students. Instructors create quizzes, manage rooms, run practice activities and formal tests, and review performance. Students join rooms, complete assigned practice quizzes, take open tests, and review released results.

## 2. User roles
- **Instructor:** creates and manages rooms, quizzes, practice assignments, tests, and results.
- **Student:** joins rooms, accesses assigned practice, takes tests, and views results when available.
- New users follow the existing onboarding flow; protected actions and access rules must be enforced by the backend.

## 3. Rooms and membership
- Multiple instructors can use QuizForge. Each instructor can own multiple rooms (for example, Java CSE-A, DSA, or MERN).
- Each room has a unique room code and invitation link. A QR code may represent the invitation link/code when QR support is implemented.
- A logged-in student can join a room using a valid room code or invitation link.
- **Joining is automatic:** a valid code/link adds the student immediately; teacher approval is not required by default.
- A student may join multiple rooms, including rooms owned by different instructors.
- Each room has one instructor owner by default. Room co-ownership/multiple-teacher collaboration is out of scope for the initial version.
- Instructors can view and manage room members and remove students.
- Room membership must be verified server-side. Joining a room does not automatically grant access to every quiz created by that instructor.

## 4. Practice mode
- Practice is managed in its own section of the instructor dashboard, separate from Test mode.
- Instructors can assign practice quizzes to one or more rooms and/or selected students.
- Only students eligible through the assignment can access that practice quiz.
- Practice attempts are unlimited by default; instructors may configure an attempt limit.
- Students see their result immediately after submission, including score, correct/incorrect answers, correct answers, and explanations when available.
- Practice results do not require a formal instructor declaration.

## 5. Test mode
- Test creation and management are handled in a separate section of the instructor dashboard.
- Tests are open-link/code assessments and do not require room membership.
- Instructors share a test using its invitation link or code. QR support can be added as another representation of the same invitation.
- There is no public test directory in the initial version; students access tests through a shared link or code.
- Any registered QuizForge student can join an open test, including students who are not members of the instructor's rooms.
- Students must be authenticated so attempts and results are associated with their account.
- One attempt is allowed by default; instructors can configure the attempt limit.
- Instructor analytics include every participant in the open test, including students outside the instructor's rooms.
- Test scores, correct answers, explanations, and result details remain hidden from students after submission until the instructor declares/releases results.
- Instructors can declare results for the whole test or release them to selected students.
- After results are released, students can log in to view their results. Email notification on declaration is a planned capability and requires email-provider integration.

## 6. Live Test Monitor
- The instructor dashboard includes a Live Test Monitor for formal tests.
- It shows per-student progress, such as answered questions out of total questions, progress percentage, and status.
- Statuses include not started, in progress, submitted, and expired.
- It must not expose marks, correctness, answers, rankings, or a live leaderboard during a formal test.
- Recommended progress definition: count questions with saved answers as answered; show unanswered questions separately and current question separately where available. A submitted attempt has submitted status regardless of its answer count.
- The existing participant-count polling is only a basic implementation and does not yet satisfy this detailed per-student monitoring requirement.

## 7. Results and analytics
- Practice results are available immediately to the student.
- Test results are visible only after instructor release.
- Instructor test analytics include all participants, not only room members.
- Provide per-quiz/class analytics such as participant count, average score, pass/needs-improvement breakdown, and topic-wise accuracy.
- Provide individual student analytics such as total attempts, average/highest/lowest score, topic-wise accuracy, strong and weak topics, progress over time, recent quiz history, and revision recommendations.
- Weak-topic analysis should be available both per quiz and across a student's overall history.
- Each question should have a topic tag and optional subtopic. Topic analytics depend on consistent question tagging.
- For open tests, analytics may distinguish room members from external participants while including both groups in totals.

## 8. Quiz creation and question data
- Manual quiz creation and topic-based AI question generation are supported in the current product.
- Each question should support a topic tag and optional subtopic to enable meaningful analytics.
- Questions may include explanations and correct-answer data. Student-facing APIs must return only fields permitted by the relevant mode and release state.
- Practice student views may receive correct answers and explanations after submission.
- Test student views must not receive answer keys, explanations, or scores before results are released.
- Uploading study material (such as PDF/DOCX) to generate questions, full AI quiz generation, QR generation/scanning, and true socket-based real-time sessions are not currently implemented and should not be presented as existing features.

## 9. Security and access-control principles
- Enforce room membership, quiz assignment, test participation, attempt limits, and result-release state on the server.
- Never rely only on frontend visibility to protect quiz content or answer keys.
- Prevent students from accessing another student's private attempt or unreleased test results.
- Validate invitation codes/links and ensure attempts are tied to authenticated student identities.

## 10. Recommended implementation order
1. Finalize data models and backend authorization for rooms, membership, practice assignments, and open tests.
2. Implement separate instructor Practice and Test workflows using shared quiz-builder components where appropriate.
3. Implement student access rules and result visibility for each mode.
4. Implement configurable attempt limits and reliable submission/expiry handling.
5. Build per-student Live Test Monitor progress and statuses.
6. Build instructor analytics and student topic-performance reports.
7. Add email notifications, QR support, study-material import, and other integrations as later enhancements.

## 11. Decisions summary
- Room joining: automatic.
- Room ownership: one instructor owner by default.
- Practice and Test: separately managed.
- Practice attempts: unlimited by default, configurable.
- Test attempts: one by default, configurable.
- Open tests: shared by link/code; no public directory.
- Open-test analytics: include all participants.
- Practice results: immediate.
- Test results: instructor-controlled release, whole test or selected students.
- Weak-topic analytics: per quiz and overall.
- Live Test Monitor: progress/status only; no live marks or rankings.
