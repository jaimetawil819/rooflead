import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  MapPin,
  MessageSquare,
  Phone,
} from "lucide-react";

const highlights = [
  {
    icon: Flame,
    title: "Know who is urgent",
    description: "Hot, warm, and cold scores keep the best leads at the top.",
  },
  {
    icon: MessageSquare,
    title: "See the whole intake",
    description: "Review the AI conversation before you call the homeowner.",
  },
  {
    icon: Phone,
    title: "Act from one screen",
    description: "Call or take over by SMS without hunting through email.",
  },
];

export default function ProductPreview() {
  return (
    <section className="bg-white py-24 px-4 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-600">
            What You See
          </p>
          <h2 className="mb-6 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            A clean lead summary before you pick up the phone.
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-gray-600">
            RoofLead turns a vague form submission into an owner-ready snapshot:
            what happened, how urgent it is, whether they own the home, and what
            to do next.
          </p>

          <div className="space-y-5">
            {highlights.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4">
                <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-slate-200/70">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Lead Detail
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                Sarah Martinez
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                HOT
              </span>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                Qualified
              </span>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="border-b border-gray-100 p-5 lg:border-b-0 lg:border-r">
              <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
                  AI Summary
                </p>
                <p className="text-sm leading-relaxed text-slate-700">
                  Hail damage after last night&apos;s storm. Water is actively
                  leaking into a bedroom. Homeowner wants an inspection as soon
                  as possible and is ready for a repair estimate.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs text-gray-400">Address</p>
                    <p className="text-sm font-medium text-slate-900">
                      1238 Laurel St, San Diego
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs text-gray-400">Urgency</p>
                    <p className="text-sm font-medium text-slate-900">
                      Emergency leak, today if possible
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs text-gray-400">Homeowner</p>
                    <p className="text-sm font-medium text-slate-900">Yes</p>
                  </div>
                </div>
              </div>

              <a
                href="tel:+16195550182"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call Sarah Now
              </a>
            </div>

            <div className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">
                  SMS Conversation
                </p>
                <span className="text-xs font-medium text-gray-400">
                  4 min intake
                </span>
              </div>

              <div className="space-y-3">
                <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-2.5 text-sm leading-relaxed text-slate-700">
                  Hi Sarah, this is ABC Roofing&apos;s assistant. What happened
                  with the roof?
                </div>
                <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-2.5 text-sm leading-relaxed text-white">
                  We had hail last night and now water is leaking in the bedroom.
                </div>
                <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-2.5 text-sm leading-relaxed text-slate-700">
                  Is water actively coming in right now, and do you own the
                  home?
                </div>
                <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-2.5 text-sm leading-relaxed text-white">
                  Yes, I own it. It is still dripping. We need someone today.
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Suggested Action
                </p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-900">
                  Call first. Active leak plus homeowner status makes this a
                  high-priority repair lead.
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                  Owner alert sent
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
