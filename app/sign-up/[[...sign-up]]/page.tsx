import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
          ∑
        </div>
        <h1 className="text-xl font-bold text-white">MathSolver</h1>
        <p className="text-gray-400 text-sm mt-1">Create your free account</p>
      </div>

      <SignUp
        signInUrl="/sign-in"
        fallbackRedirectUrl="/"
        forceRedirectUrl="/"
      />
    </main>
  )
}
