import Link from "next/link";

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 bg-white";

export default function SampleTestFormPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <div className="mb-6">
          <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
            Sample Opt-In Form
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-3 mb-1">
            Request a Roofing Estimate
          </h1>
          <p className="text-sm text-gray-500">
            This sample shows how homeowners opt in to receive SMS lead
            qualification messages from a roofing company using RoofLead.
          </p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Your Name
            </label>
            <input className={inputClass} placeholder="Jane Smith" readOnly />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              className={inputClass}
              placeholder="+1 555 000 0000"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Property Address
            </label>
            <input
              className={inputClass}
              placeholder="123 Main St, San Diego, CA"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              What do you need?
            </label>
            <select className={inputClass} defaultValue="repair">
              <option value="repair">Roof Repair</option>
              <option value="replacement">Full Replacement</option>
              <option value="inspection">Inspection</option>
              <option value="storm_damage">Storm Damage</option>
            </select>
          </div>

          <p className="text-xs leading-relaxed text-gray-500">
            By submitting, you agree to receive automated SMS messages from this
            roofing business about your estimate request. Message and data rates
            may apply. Message frequency varies. Reply STOP to opt out or HELP
            for help. See our{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms
            </Link>
            .
          </p>

          <button
            type="button"
            className="w-full bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg"
          >
            Get a Free Estimate
          </button>
        </form>
      </div>
    </div>
  );
}
