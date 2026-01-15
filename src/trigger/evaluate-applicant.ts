import { task } from "@trigger.dev/sdk/v3";
import { evaluateApplicantById } from "@/lib/ai-evaluation";

export const evaluateApplicantTask = task({
    id: "evaluate-applicant",
    run: async (payload: { applicantId: string }) => {
        console.log(`🚀 Starting background evaluation for applicant: ${payload.applicantId}`);

        // Call the existing logic
        // Ensure environment variables are set in Trigger.dev dashboard for this to work in production
        const result = await evaluateApplicantById(payload.applicantId);

        if (!result) {
            // We log error but don't throw if we want to avoid infinite retries for hard failures
            // But throwing allows Trigger.dev to show it as failed
            console.error("Evaluation returned null");
            throw new Error("AI evaluation failed to return a result");
        }

        console.log(`✅ Evaluation complete: Score ${result.score}`);
        return result;
    },
});
