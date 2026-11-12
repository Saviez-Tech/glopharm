"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";

/* -------------------------------------------------------------------------- */
/*  ADD YOUR OWN IMAGE                                                         */
/*  Option 1: drop your screenshot at  public/images/auth-preview.png          */
/*  Option 2: change AUTH_IMAGE below to any path / URL.                       */
/*  Option 3: click the placeholder in the blue panel to pick a file (preview) */
/*  Optionally give each slide its own `image`.                                */
/* -------------------------------------------------------------------------- */
const AUTH_IMAGE = "/images/auth-preview.png";

const SLIDES: { title: string; text: string; image?: string }[] = [
    {
        title: "Easy-to-Use Dashboard for Managing Your Business.",
        text: "Streamline Your Business Management with Our User-Friendly Dashboard. Simplify complex tasks, track key metrics, and make informed decisions effortlessly.",
    },
    {
        title: "Track Every Product and Sale in Real Time.",
        text: "Keep an eye on stock levels, orders and revenue from a single, clean overview built for busy teams.",
    },
    {
        title: "Grow Faster With Insights That Matter.",
        text: "Spot trends early with clear reports and make confident decisions for your store every day.",
    },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* -------------------------------- Icons ---------------------------------- */

const Logo = () => (
    <div className="flex items-center gap-2">
        <svg viewBox="0 0 48 44" className="h-9 w-10" aria-hidden>
            <path d="M2 42 20 6l8 16-10 20Z" fill="#a3e635" />
            <path d="M20 6h6l20 36H18Z" fill="#2563eb" />
            <path d="M18 42 28 22l8 20Z" fill="#1d4ed8" />
        </svg>
        <span className="text-3xl font-semibold tracking-tight text-gray-800">Culters</span>
    </div>
);

const GoogleIcon = () => (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5Z" />
        <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 7l7.4 5.7c4.3-4 6.9-9.9 6.9-17.2Z" />
        <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1Z" />
        <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.9 2.3-8.5 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48Z" />
    </svg>
);

const CheckCircle = () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-600" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={1.8} />
        <path d="m7.5 12.5 3 3 6-6.5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const EyeIcon = ({ off }: { off: boolean }) => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
        {off && <path d="M3 3l18 18" />}
    </svg>
);

const Hexagon = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden>
        <path d="M50 3 93 27v46L50 97 7 73V27Z" stroke="currentColor" strokeWidth={2} />
    </svg>
);

/* ------------------------------- Component ------------------------------- */

export default function AuthPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [slide, setSlide] = useState(0);
    const [imgFailed, setImgFailed] = useState(false);
    const [localImage, setLocalImage] = useState<string | null>(null);

    const emailValid = EMAIL_RE.test(email);

    // Auto-advance the carousel
    useEffect(() => {
        const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5000);
        return () => clearInterval(t);
    }, []);

    // Free object URL when replaced / unmounted
    useEffect(() => {
        return () => {
            if (localImage) URL.revokeObjectURL(localImage);
        };
    }, [localImage]);

    const onPickImage = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLocalImage(URL.createObjectURL(file));
    };

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        if (!emailValid) return setError("Please enter a valid email address.");
        if (password.length < 6) return setError("Password must be at least 6 characters.");

        setLoading(true);
        try {
            // TODO: replace with your real auth call, e.g. signIn("credentials", {...})
            await new Promise((r) => setTimeout(r, 800));
            console.log({ email, password, remember });
            router.push('/glopharm');
        } finally {
            setLoading(false);
        }
    };

    const current = SLIDES[slide];
    const imageSrc = localImage ?? current.image ?? AUTH_IMAGE;
    const showImage = localImage !== null || !imgFailed;

    return (
        <div className="flex min-h-screen bg-white">
            {/* ----------------------------- Left: form ---------------------------- */}
            <section className="flex w-full items-center justify-center px-6 py-10 md:w-1/2 md:px-12">
                <div className="w-full max-w-md">
                    <Logo />

                    <h1 className="mt-10 text-2xl font-semibold text-gray-900 md:mt-14">Sign Up</h1>
                    <p className="mt-1 text-xs text-gray-500">
                        Lorem ipsum dolor sit amet consectetur. Leo eget quam dui in posuere nulla.
                    </p>

                    <button
                        type="button"
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-blue-600 bg-white py-2.5 text-xs font-semibold text-gray-800 transition hover:bg-blue-50"
                    >
                        <GoogleIcon />
                        <span className="text-blue-700">Sign In with Google</span>
                    </button>

                    {/* Divider */}
                    <div className="my-5 flex items-center gap-3 text-xs text-gray-500">
                        <span className="h-px flex-1 bg-blue-200" />
                        Or
                        <span className="h-px flex-1 bg-blue-200" />
                    </div>

                    <form onSubmit={onSubmit} noValidate className="space-y-4">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-gray-800">
                                Email
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Input email"
                                    className={`w-full rounded-lg border px-3.5 py-3 pr-11 text-xs text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-blue-100 ${emailValid ? "border-blue-600 border-2" : "border-gray-300 focus:border-blue-500"
                                        }`}
                                />
                                {emailValid && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <CheckCircle />
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-gray-800">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Input password"
                                    className="w-full rounded-lg border border-gray-300 px-3.5 py-3 pr-11 text-xs text-gray-800 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    <EyeIcon off={!showPassword} />
                                </button>
                            </div>
                        </div>

                        {/* Remember + forgot */}
                        <div className="flex items-center justify-between text-xs">
                            <label className="flex cursor-pointer items-center gap-2 font-medium text-gray-800">
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-400 accent-blue-600"
                                />
                                Remember me ?
                            </label>
                            <a href="/forgot-password" className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700">
                                Forget Password
                            </a>
                        </div>

                        {error && (
                            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-blue-600 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <p className="mt-5 text-center text-xs text-gray-700">
                        Do not have account ?{" "}
                        <a href="/sign-up" className="font-semibold text-blue-600 hover:underline">
                            Sign Up
                        </a>
                    </p>
                </div>
            </section>

            {/* ------------------------ Right: promo panel ------------------------- */}
            <aside className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-blue-600 px-10 py-10 text-white md:flex">
                {/* Decorative hexagons */}
                <Hexagon className="absolute -top-10 left-1/3 h-44 w-44 text-white/30" />
                <Hexagon className="absolute -right-10 top-4 h-40 w-40 rotate-12 fill-white/20 text-white/30" />
                <Hexagon className="absolute -right-16 top-1/2 h-56 w-56 text-white/30" />
                <Hexagon className="absolute -bottom-20 left-1/4 h-72 w-72 fill-white/20 text-white/40" />
                <Hexagon className="absolute -left-12 top-24 h-32 w-32 text-white/20" />

                {/* Image slot */}
                <div className="relative z-10 w-full max-w-[560px]">
                    {showImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            key={imageSrc}
                            src={imageSrc}
                            alt="Dashboard preview"
                            onError={() => setImgFailed(true)}
                            onLoad={() => setImgFailed(false)}
                            className="w-full rounded-2xl bg-white object-cover shadow-2xl"
                        />
                    ) : (
                        <label className="flex aspect-[16/10] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/60 bg-white/10 text-center text-sm backdrop-blur-sm transition hover:bg-white/20">
                            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <circle cx="9" cy="9" r="1.5" />
                                <path d="m21 15-5-5L5 21" />
                            </svg>
                            <span className="font-semibold">Click to add your image</span>
                            <span className="px-6 text-xs text-white/80">
                                or save it as <code className="rounded bg-white/20 px-1">public/images/auth-preview.png</code>
                            </span>
                            <input type="file" accept="image/*" onChange={onPickImage} className="hidden" />
                        </label>
                    )}
                </div>

                {/* Slide text */}
                <div className="relative z-10 mt-10 max-w-lg text-center">
                    <h2 className="text-3xl font-medium leading-snug">{current.title}</h2>
                    <p className="mx-auto mt-4 max-w-md text-xs leading-relaxed text-white/80">{current.text}</p>
                </div>

                {/* Dots */}
                <div className="relative z-10 mt-8 flex items-center gap-1.5">
                    {SLIDES.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setSlide(i)}
                            aria-label={`Go to slide ${i + 1}`}
                            className={`h-1 rounded-full transition-all ${i === slide ? "w-6 bg-white" : "w-3 bg-white/50 hover:bg-white/70"}`}
                        />
                    ))}
                </div>
            </aside>
        </div>
    );
}