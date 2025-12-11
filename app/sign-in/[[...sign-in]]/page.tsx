import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-playfair text-4xl font-bold text-gray-800 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to continue your mystical journey
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'neumorphic-card shadow-neumorphic-xl rounded-2xl',
              headerTitle: 'font-playfair text-2xl',
              headerSubtitle: 'text-gray-600',
              socialButtonsBlockButton:
                'neumorphic-card hover:shadow-neumorphic-pressed transition-all',
              formButtonPrimary:
                'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg transition-all',
              formFieldInput:
                'neumorphic-inset rounded-xl focus:ring-2 focus:ring-purple-400',
              footerActionLink: 'text-purple-600 hover:text-purple-700',
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  )
}
