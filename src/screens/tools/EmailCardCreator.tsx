import { useState } from "react";
import { Check, FileText, Globe, Mail, Phone } from "lucide-react";
import { useAppState } from "../../state/context";
import { getStaffEmail } from "../../utils/email";
import { getStaffFullName, getStaffMobile } from "../../utils/staff";
import { PageHeader } from "../../components/PageHeader";
import { PrimaryButton } from "../../components/PrimaryButton";

function LogoIcon({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <rect
          x="10"
          y="35"
          width="35"
          height="55"
          rx="3"
          fill="#3B82F6"
          stroke="#2563EB"
          strokeWidth="2"
        />
        <rect x="18" y="45" width="8" height="6" rx="1" fill="#93C5FD" />
        <rect x="30" y="45" width="8" height="6" rx="1" fill="#93C5FD" />
        <rect x="18" y="56" width="8" height="6" rx="1" fill="#93C5FD" />
        <rect x="30" y="56" width="8" height="6" rx="1" fill="#93C5FD" />
        <rect x="18" y="67" width="8" height="6" rx="1" fill="#93C5FD" />
        <polygon points="55,10 90,35 55,35" fill="#3B82F6" stroke="#2563EB" strokeWidth="2" />
        <rect
          x="55"
          y="35"
          width="35"
          height="55"
          rx="3"
          fill="#3B82F6"
          stroke="#2563EB"
          strokeWidth="2"
        />
        <rect x="63" y="45" width="8" height="6" rx="1" fill="#93C5FD" />
        <rect x="75" y="45" width="8" height="6" rx="1" fill="#93C5FD" />
        <rect x="63" y="56" width="8" height="6" rx="1" fill="#93C5FD" />
        <rect x="75" y="56" width="8" height="6" rx="1" fill="#93C5FD" />
        <rect x="63" y="67" width="8" height="6" rx="1" fill="#93C5FD" />
        <path
          d="M 15 78 Q 25 65 40 80 Q 55 90 75 72 Q 85 65 92 70"
          stroke="#F59E0B"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function EmailCardCreatorPage() {
  const state = useAppState();
  const [selectedStaffId, setSelectedStaffId] = useState(
    state.staff[1]?.id || state.staff[0]?.id || "",
  );
  const [tab, setTab] = useState<"card" | "signature">("card");
  const [copied, setCopied] = useState(false);

  const staffMember = state.staff.find((s) => s.id === selectedStaffId);
  const dept = staffMember
    ? state.departments.find((d) => d.id === staffMember.departmentId)
    : null;
  const grade = staffMember ? state.grades.find((g) => g.id === staffMember.gradeId) : null;
  const fn = staffMember
    ? state.functions.find((f) => f.id === staffMember.primaryFunctionId)
    : null;
  const email = staffMember ? getStaffEmail(staffMember, state.appSettings) : "";
  const phone = staffMember ? getStaffMobile(staffMember) : "";
  const title = grade && fn ? `${grade.name}, ${fn.name}` : fn ? fn.name : "";
  const fullName = staffMember ? getStaffFullName(staffMember) : "";
  const cp = state.companyProfile;

  const staffOptions = state.staff.map((s) => {
    const d = state.departments.find((dep) => dep.id === s.departmentId);
    return { value: s.id, label: `${getStaffFullName(s)} - ${d?.name || ""}` };
  });

  const handleCopySignature = () => {
    const sigText = [
      fullName,
      `${title} - ${dept?.name || ""}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Web: ${cp.website}`,
      `${cp.name} - ${cp.location}`,
    ].join("\n");
    navigator.clipboard
      .writeText(sigText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        /* ignore */
      });
  };

  return (
    <div>
      <PageHeader
        title="Email & Card Creator"
        subtitle="Generate business cards and email signatures for staff"
      />

      {/* Staff Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Select Staff Member:
          </label>
          <div className="w-80">
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {staffOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-6 border-b border-gray-200">
        <button
          onClick={() => setTab("card")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === "card" ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          <FileText className="w-4 h-4" /> Business Card
        </button>
        <button
          onClick={() => setTab("signature")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === "signature" ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          <Mail className="w-4 h-4" /> Email Signature
        </button>
      </div>

      {/* Business Card Tab */}
      {tab === "card" && staffMember && (
        <div className="flex flex-col items-center gap-6">
          {/* Front */}
          <div
            className="w-[420px] h-[250px] rounded-xl overflow-hidden shadow-lg"
            style={{ background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)" }}
          >
            <div className="p-6 h-full flex flex-col justify-between text-white relative">
              <div className="absolute top-5 right-5">
                <LogoIcon size={44} />
              </div>
              <div>
                <h3 className="text-xl font-bold">{fullName}</h3>
                <p className="text-blue-100 text-sm mt-0.5">{title}</p>
                <p className="text-blue-200 text-xs mt-0.5">{dept?.name || ""}</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-3.5 h-3.5 text-blue-200" />
                  <span className="text-blue-50">{email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-3.5 h-3.5 text-blue-200" />
                  <span className="text-blue-50">{phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-3.5 h-3.5 text-blue-200" />
                  <span className="text-blue-50">{cp.website}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Back */}
          <div className="w-[420px] h-[250px] rounded-xl overflow-hidden shadow-lg bg-white border border-gray-200">
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <LogoIcon size={56} className="mb-4" />
              <h4 className="text-lg font-bold text-gray-900">{cp.name}</h4>
              <p className="text-sm text-gray-500 mt-1">{cp.location}</p>
              <p className="text-sm text-gray-400 mt-0.5">{cp.website}</p>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-2">
            Front and back preview - print-ready at 3.5&quot; x 2&quot;
          </p>
        </div>
      )}

      {/* Email Signature Tab */}
      {tab === "signature" && staffMember && (
        <div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900">Signature Preview</h3>
              <PrimaryButton
                variant="secondary"
                icon={copied ? Check : FileText}
                onClick={handleCopySignature}
              >
                {copied ? "Copied!" : "Copy Signature"}
              </PrimaryButton>
            </div>

            <div className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-start gap-4">
                <LogoIcon size={48} className="flex-shrink-0" />
                <div className="space-y-1.5">
                  <p className="font-bold text-gray-900">{fullName}</p>
                  <p className="text-sm text-gray-600">
                    {title} - {dept?.name || ""}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-3.5 h-3.5 text-gray-400" />
                    <a href="#" className="text-blue-600 hover:underline">
                      {cp.website}
                    </a>
                  </div>
                  <p className="text-xs text-gray-400 pt-1">
                    {cp.name} - {cp.location}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Click &quot;Copy Signature&quot; and paste into your email client&apos;s signature
            settings (Gmail, Outlook, etc.)
          </p>
        </div>
      )}

      {!staffMember && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">
            Select a staff member above to preview their business card and email signature.
          </p>
        </div>
      )}
    </div>
  );
}
