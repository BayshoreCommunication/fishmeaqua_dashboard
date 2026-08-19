import { getUserById } from "@/app/actions/user";
import { getUserStage } from "@/lib/userStage";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import {
  BiArrowBack,
  BiBuilding,
  BiCalendar,
  BiCheck,
  BiEnvelope,
  BiGlobe,
  BiPhone,
  BiUser,
} from "react-icons/bi";

function numOrDash(value: number | null | undefined) {
  return typeof value === "number" ? value : "—";
}

interface JourneyStep {
  label: string;
  done: boolean;
  detail?: string;
}

function StepCircle({
  complete,
  current,
  index,
}: {
  complete: boolean;
  current: boolean;
  index: number;
}) {
  return (
    <div
      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold ${
        complete
          ? "border-green-500 bg-green-500 text-white"
          : current
            ? "border-primary bg-primary/10 text-primary-dark"
            : "border-gray-200 bg-white text-gray-300"
      }`}
    >
      {complete ? <BiCheck size={20} /> : index + 1}
    </div>
  );
}

// Gentle S-curve, dashed, filling whatever width/height the flex box gives it.
function HorizontalConnector({ complete }: { complete: boolean }) {
  return (
    <svg
      className="mt-2 h-5 flex-1"
      viewBox="0 0 100 20"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0,10 C 30,-2 70,22 100,10"
        fill="none"
        stroke={complete ? "#22c55e" : "#d1d5db"}
        strokeWidth="2"
        strokeDasharray="7 6"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function VerticalConnector({ complete }: { complete: boolean }) {
  return (
    <svg
      className="w-5 flex-1 min-h-[32px]"
      viewBox="0 0 20 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M10,0 C -2,30 22,70 10,100"
        fill="none"
        stroke={complete ? "#22c55e" : "#d1d5db"}
        strokeWidth="2"
        strokeDasharray="7 6"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function JourneyTracker({ steps }: { steps: JourneyStep[] }) {
  // Furthest reached step = last one marked done in sequence, so a step
  // completed out of order (rare, but the data allows it) still lights up
  // every step behind it instead of leaving gaps.
  let lastDoneIndex = -1;
  steps.forEach((s, i) => {
    if (s.done) lastDoneIndex = i;
  });

  return (
    <>
      {/* Desktop: horizontal timeline. Fixed-width columns and flex-1
          connectors are direct siblings here (not nested per-step) so every
          gap gets an equal share of the remaining space. */}
      <div className="hidden md:flex md:items-start">
        {steps.map((step, i) => {
          const complete = i <= lastDoneIndex;
          const current = i === lastDoneIndex + 1;
          return (
            <Fragment key={step.label}>
              {i > 0 && <HorizontalConnector complete={i <= lastDoneIndex} />}
              <div className="flex w-28 flex-shrink-0 flex-col items-center text-center">
                <StepCircle complete={complete} current={current} index={i} />
                <p
                  className={`mt-3 text-sm font-medium ${
                    complete ? "text-gray-900" : current ? "text-primary-dark" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </p>
                {step.detail && (
                  <p className="mt-0.5 text-xs text-gray-500">{step.detail}</p>
                )}
              </div>
            </Fragment>
          );
        })}
      </div>

      {/* Mobile: vertical timeline. */}
      <div className="flex flex-col md:hidden">
        {steps.map((step, i) => {
          const complete = i <= lastDoneIndex;
          const current = i === lastDoneIndex + 1;
          return (
            <div key={step.label} className="flex gap-4">
              <div className="flex flex-col items-center">
                <StepCircle complete={complete} current={current} index={i} />
                {i < steps.length - 1 && <VerticalConnector complete={i < lastDoneIndex} />}
              </div>
              <div className="pb-6 pt-1.5">
                <p
                  className={`text-sm font-medium ${
                    complete ? "text-gray-900" : current ? "text-primary-dark" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </p>
                {step.detail && (
                  <p className="mt-0.5 text-xs text-gray-500">{step.detail}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 break-all">{value}</p>
      </div>
    </div>
  );
}

export default async function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getUserById(id);

  if (!res.ok || !res.data) {
    notFound();
  }

  const user = res.data;
  const stage = getUserStage(user);
  const hasWidget = Boolean(user.vector_store_id);
  const train = user.train_data;

  const steps: JourneyStep[] = [
    {
      label: "Signed Up",
      done: true,
      detail: new Date(user.created_at).toLocaleDateString(),
    },
    {
      label: "Email Verified",
      done: user.is_verified,
    },
    {
      label: "Widget Created",
      done: hasWidget,
      detail: hasWidget ? "Vector store ready" : undefined,
    },
    {
      label: "AI Trained",
      done: Boolean(train?.is_trained),
      detail:
        train?.is_trained && typeof train.pages_crawled === "number"
          ? `${train.pages_crawled} pages crawled`
          : undefined,
    },
    {
      label: "Trial Started",
      done: user.is_subscribed || user.has_paid_subscription,
      detail: user.subscription_start_date
        ? new Date(user.subscription_start_date).toLocaleDateString()
        : undefined,
    },
    {
      label: "Converted to Paid",
      done: user.has_paid_subscription,
    },
  ];

  return (
    <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="rounded border border-gray-200 bg-white p-6">
        <Link
          href="/users"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <BiArrowBack size={16} />
          Back to Users
        </Link>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-blue-600">
              {user.company_name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user.company_name}</h1>
              <p className="text-sm text-gray-500">{user.company_type}</p>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${stage.badgeClass}`}>
            {stage.label}
          </span>
        </div>
      </div>

      {/* Journey */}
      <div className="rounded border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-6">
          Journey
        </h2>
        <JourneyTracker steps={steps} />
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Contact &amp; Company
          </h2>
          <div className="space-y-4">
            <InfoRow icon={<BiBuilding size={16} />} label="Company Type" value={user.company_type || "—"} />
            <InfoRow icon={<BiGlobe size={16} />} label="Website" value={user.company_website || "—"} />
            <InfoRow icon={<BiEnvelope size={16} />} label="Email" value={user.email} />
            <InfoRow icon={<BiPhone size={16} />} label="Phone" value={user.phone_number || "—"} />
            <InfoRow icon={<BiUser size={16} />} label="Role" value={user.role || "—"} />
          </div>
        </div>

        <div className="rounded border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Account &amp; Subscription
          </h2>
          <div className="space-y-4">
            <InfoRow
              icon={<BiCheck size={16} />}
              label="Account Status"
              value={
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    user.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              }
            />
            <InfoRow
              icon={<BiCheck size={16} />}
              label="Verified"
              value={user.is_verified ? "Yes" : "No"}
            />
            <InfoRow icon={<BiCheck size={16} />} label="Plan" value={user.subscription_type} />
            <InfoRow
              icon={<BiCalendar size={16} />}
              label="Subscription Start"
              value={
                user.subscription_start_date
                  ? new Date(user.subscription_start_date).toLocaleDateString()
                  : "—"
              }
            />
            <InfoRow
              icon={<BiCalendar size={16} />}
              label="Subscription End"
              value={
                user.subscription_end_date
                  ? new Date(user.subscription_end_date).toLocaleDateString()
                  : "—"
              }
            />
            <InfoRow
              icon={<BiCalendar size={16} />}
              label="Signed Up"
              value={new Date(user.created_at).toLocaleString()}
            />
            <InfoRow
              icon={<BiCalendar size={16} />}
              label="Last Updated"
              value={new Date(user.updated_at).toLocaleString()}
            />
          </div>
        </div>

        <div className="rounded border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Widget &amp; Training
          </h2>
          <div className="space-y-4">
            <InfoRow
              icon={<BiCheck size={16} />}
              label="Widget Created"
              value={hasWidget ? "Yes" : "No"}
            />
            {hasWidget && (
              <InfoRow
                icon={<BiCheck size={16} />}
                label="Vector Store ID"
                value={user.vector_store_id}
              />
            )}
            <InfoRow
              icon={<BiCheck size={16} />}
              label="AI Trained"
              value={train?.is_trained ? "Yes" : "No"}
            />
            {train && (
              <>
                <InfoRow
                  icon={<BiCheck size={16} />}
                  label="Pages Crawled"
                  value={numOrDash(train.pages_crawled)}
                />
                <InfoRow
                  icon={<BiCheck size={16} />}
                  label="Entries Stored"
                  value={numOrDash(train.entries_stored)}
                />
                <InfoRow
                  icon={<BiCheck size={16} />}
                  label="Training Updates"
                  value={`${numOrDash(train.update_count)} / ${numOrDash(train.update_limit)}`}
                />
                <InfoRow icon={<BiCheck size={16} />} label="Score" value={numOrDash(train.score)} />
                <InfoRow
                  icon={<BiCalendar size={16} />}
                  label="Last Trained"
                  value={train.last_updated ? new Date(train.last_updated).toLocaleString() : "—"}
                />
                {train.categories && train.categories.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Trained Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {train.categories.map((c) => (
                        <span
                          key={c}
                          className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
