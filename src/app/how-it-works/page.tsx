const STEPS: { title: string; body: string[]; dark?: boolean }[] = [
  {
    title: "Click Post A Job Button and Enter Job Details",
    body: [
      "The Job Details page contains pop ups and guidelines to help with deciding cost, wording and sensitive data.",
      "You may choose to Pay the entire cost of the Job upfront or when you accept a freelancer. This amount is fully refundable if the Job is deleted. You may choose to submit payment from your own account or an external wallet such as bank, credit card or block chain transactions.",
      "Once you Submit the Job, it is live to freelancers who may start sending in their applications.",
    ],
  },
  {
    title: "Receive Applications",
    dark: true,
    body: [
      "You may start receiving Job Applications from freelancers depending on the level of traffic.",
      "Filter Applications based on Rating, location, Category, Experience level and previous Jobs. You may: i) Add Applicants to your Wishlist. ii) Deny Applicants — they will be removed from the Applicant pool. iii) Accept Applicants — once an applicant has been accepted, you will be redirected to our Goodturn Connect Workstation where you can communicate with your workers, submit files and use our in app features and APIs to improve the quality of your work.",
      "Please note: Once you have accepted a worker, we may monitor the amount of work done by an individual to ensure fair payment goes to every party.",
    ],
  },
  {
    title: "Submission Requests",
    body: [
      "Once worker(s) complete a project, they submit a completion request.",
      "This request acts as a contract between you and the worker(s) certifying that the Job is Complete.",
      "You will rate the each worker and submit comments about their work. This is important to boost the workers rating.",
    ],
  },
  {
    title: "Completion and Payment Release",
    dark: true,
    body: [
      "Once you approve the completion request, the Job is marked Complete.",
      "Payment is released to the worker(s) and reflects in their account balance, ready to withdraw.",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="bg-brand text-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h1 className="text-4xl font-extrabold">How it Works</h1>
          <p className="mt-4 max-w-3xl text-lg text-neutral-200">
            Below is a step by step guideline on how to Post a job with a Summary of the entire Post a Job
            workflow.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-extrabold">The Post A Job Workflow</h2>
        <ol className="mt-12 space-y-10">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-6">
              <span className="text-5xl font-extrabold text-neutral-400">{i + 1}</span>
              <div
                className={`flex-1 rounded-2xl p-8 ${
                  step.dark ? "bg-ink text-white" : "bg-neutral-100 text-neutral-800"
                }`}
              >
                <h3 className={`text-xl font-bold ${step.dark ? "text-white" : "text-brand"}`}>{step.title}</h3>
                {step.body.map((p, j) => (
                  <p key={j} className={`mt-3 leading-relaxed ${step.dark ? "text-neutral-300" : ""}`}>
                    {p}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
