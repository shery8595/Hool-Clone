import {
  Brain,
  Database,
  FileText,
  Fingerprint,
  Globe,
  Lock,
  MessageCircle,
  RefreshCw,
  Search,
  Shield,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { DemoNamespaceCopy } from "@/components/landing/demo-namespace-copy";
import { LandingWalrusMemoryVisual } from "@/components/landing/landing-walrus-memory-visual";
import {
  DEMO_NAMESPACE,
  DEMO_EVOLUTION_URL,
  DEMO_PROFILE_URL,
  walrusMemoryFeatures,
  walrusMemoryProofPoints,
} from "@/lib/landing/content";
import { cn } from "@/lib/utils";

const steps = [
  {
    step: "01",
    title: "Train",
    description:
      "Answer onboarding questions about your loyalties, vibes, and rivalries. Each answer becomes a Walrus memory receipt.",
    icon: Zap,
    href: "/train",
    image: "/landing/how-it-works-1.png",
    imageScale: "scale-[1.265]",
  },
  {
    step: "02",
    title: "Predict",
    description:
      "Lock in match picks. Your clone recalls your memories and generates its own prediction — with cited receipts.",
    icon: Target,
    href: "/predict",
    image: "/landing/how-it-works-2.png",
    imageScale: "scale-[1.392]",
    imageOffset: "-translate-y-[10%]",
  },
  {
    step: "03",
    title: "Debate",
    description:
      "Argue with your clone. It pulls from stored memories, cites contradictions, and updates when you correct it.",
    icon: MessageCircle,
    href: "/debate",
    image: "/landing/how-it-works-3.png",
    imageScale: "scale-[1.392]",
    imageOffset: "-translate-y-[5%]",
  },
  {
    step: "04",
    title: "Remember",
    description:
      "Every take, correction, and post-match roast is durably stored on Walrus Mainnet — verifiable and evolving.",
    icon: Database,
    href: "/memory",
    image: "/landing/how-it-works-4.png",
    imageScale: "scale-[1.265]",
  },
] as const;

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="bg-hoolclone-page-bg py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-6" data-reveal-section>
        <div className="mx-auto max-w-2xl text-center" data-reveal-item>
          <h2 className="text-2xl font-black uppercase tracking-tight text-hoolclone-gray-900 sm:text-3xl">
            How It Works
          </h2>
          <p className="mt-3 text-muted-foreground">
            Not predicting football. Predicting you. Four flows that turn your
            fan brain into a clone that argues back.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4 xl:gap-5">
          {steps.map((item) => {
            const {
              step,
              title,
              description,
              icon: Icon,
              href,
              image,
              imageScale,
            } = item;
            const imageOffset =
              "imageOffset" in item ? item.imageOffset : undefined;

            return (
            <div
              key={step}
              data-reveal-item
              className="group flex flex-col rounded-2xl border border-border/50 bg-white shadow-[0_4px_24px_rgba(10,61,46,0.06)] transition-all duration-300 ease-out hover:-translate-y-2 hover:border-hoolclone-green-700/20 hover:shadow-[0_16px_48px_rgba(10,61,46,0.14)]"
            >
              <div className="flex flex-1 flex-col p-5 pb-4">
                <p className="text-5xl font-black leading-none tracking-tighter transition-transform duration-300 group-hover:scale-105" aria-hidden>
                  <span className="inline-block text-hoolclone-green-300 transition-all duration-300 group-hover:text-hoolclone-green-600">
                    0
                  </span>
                  <span className="inline-block text-hoolclone-green-500 transition-all duration-300 group-hover:text-hoolclone-green-700">
                    {step.slice(-1)}
                  </span>
                </p>
                <span className="sr-only">Step {step}</span>
                <div className="mt-3 flex h-9 w-9 items-center justify-center rounded-full bg-hoolclone-green-100 transition-colors duration-300 group-hover:bg-hoolclone-green-700">
                  <Icon className="h-4 w-4 text-hoolclone-green-700 transition-colors duration-300 group-hover:text-white" />
                </div>

                <div className="relative my-4 flex min-h-[9.5rem] items-center justify-center overflow-visible sm:min-h-[10.5rem]">
                  <div className="transition-transform duration-500 ease-out group-hover:scale-[1.06]">
                    <div className={cn(imageScale, imageOffset)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt={`${title} — HoolClone how it works`}
                        className="h-auto w-full max-w-[11.5rem] object-contain object-center sm:max-w-[12.5rem]"
                        draggable={false}
                      />
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-hoolclone-gray-900 transition-colors duration-300 group-hover:text-hoolclone-green-900">
                  {title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
                <ButtonLink
                  href={href}
                  variant="link"
                  className="mt-4 h-auto justify-start p-0 text-sm font-semibold text-hoolclone-green-700 transition-all duration-300 group-hover:translate-x-1 group-hover:text-hoolclone-green-800"
                >
                  Try {title} →
                </ButtonLink>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function LandingWalrusMemory() {
  const featureIconMap = {
    shield: Shield,
    receipt: FileText,
    brain: Brain,
    refresh: RefreshCw,
  } as const;

  const proofIconMap = {
    globe: Globe,
    lock: Lock,
    zap: Zap,
    fingerprint: Fingerprint,
  } as const;

  return (
    <section
      id="walrus-memory"
      className="border-y border-border/60 bg-gradient-to-b from-hoolclone-green-50/70 via-white to-hoolclone-green-50/40 py-16 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,34rem)_minmax(0,1fr)] lg:gap-8 xl:gap-12">
          <div className="order-1 lg:max-w-md lg:justify-self-end xl:max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full border border-hoolclone-green-200 bg-white px-3 py-1.5 shadow-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-hoolclone-green-900 text-white">
                <Database className="h-3.5 w-3.5" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-hoolclone-green-800">
                Walrus Memory
              </span>
            </div>

            <h2 className="mt-5 text-3xl font-black uppercase leading-[0.95] tracking-tight text-hoolclone-gray-900 sm:text-4xl xl:text-[2.75rem]">
              Memory Is the{" "}
              <span className="relative inline-block text-hoolclone-green-900">
                Product
                <span
                  className="absolute -bottom-1 left-0 h-2.5 w-full -skew-x-6 rounded-sm bg-hoolclone-yellow-400/90"
                  aria-hidden
                />
              </span>
            </h2>

            <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              HoolClone isn&apos;t a chatbot with amnesia. Every take, correction,
              debate, and post-match roast becomes a durable memory receipt on
              Walrus Mainnet —{" "}
              <span className="font-semibold text-hoolclone-green-900">
                verifiable, behavioral, and evolving.
              </span>
            </p>

            <ul className="mt-6 space-y-3.5">
              {walrusMemoryFeatures.map(({ label, icon }) => {
                const Icon = featureIconMap[icon];
                return (
                  <li key={label} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-hoolclone-green-100 text-hoolclone-green-800">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="pt-1 leading-relaxed text-hoolclone-gray-900/90">
                      {label}
                    </span>
                  </li>
                );
              })}
            </ul>

            <ButtonLink
              href={DEMO_EVOLUTION_URL}
              className="mt-8 gap-2 rounded-full px-6 shadow-[0_10px_30px_rgba(10,61,46,0.18)]"
            >
              <Search className="h-4 w-4" />
              Judge evolution demo
            </ButtonLink>
          </div>

          <div className="order-2 flex justify-center lg:order-2">
            <LandingWalrusMemoryVisual className="w-full" />
          </div>

          <div className="order-3 lg:max-w-sm lg:justify-self-start xl:max-w-md">
            <div className="rounded-3xl border border-hoolclone-green-100 bg-white p-5 shadow-[0_12px_40px_rgba(10,61,46,0.08)] sm:p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Demo namespace
              </p>
              <div className="mt-2">
                <DemoNamespaceCopy value={DEMO_NAMESPACE} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-hoolclone-green-100 bg-hoolclone-green-50/70 px-4 py-4 text-center">
                  <p className="text-3xl font-black text-hoolclone-green-900">15</p>
                  <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                    Mainnet memories
                  </p>
                </div>
                <div className="rounded-2xl border border-hoolclone-green-100 bg-hoolclone-green-50/70 px-4 py-4 text-center">
                  <p className="text-3xl font-black text-hoolclone-green-900">100%</p>
                  <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                    Verifiable blobs
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {walrusMemoryProofPoints.map(({ label, icon }) => {
                  const Icon = proofIconMap[icon];
                  return (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-2 rounded-2xl border border-hoolclone-green-100/80 bg-hoolclone-gray-50/80 px-2 py-3 text-center"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-hoolclone-green-800 shadow-sm">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="text-[10px] font-semibold leading-tight text-hoolclone-gray-900">
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-hoolclone-yellow-200 bg-gradient-to-r from-hoolclone-yellow-50 to-white px-4 py-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-hoolclone-yellow-400/30 text-hoolclone-yellow-700">
                  <Trophy className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Expand any memory card on the demo profile to see{" "}
                    <span className="font-semibold text-hoolclone-green-900">
                      Verified on Walrus Mainnet
                    </span>{" "}
                    with full proof.
                  </p>
                  <ButtonLink
                    href={DEMO_PROFILE_URL}
                    variant="link"
                    className="mt-2 h-auto justify-start p-0 text-xs font-semibold text-hoolclone-green-800"
                  >
                    View demo profile →
                  </ButtonLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
