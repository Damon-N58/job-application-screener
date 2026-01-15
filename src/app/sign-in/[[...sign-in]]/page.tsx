import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black">
                            <span className="text-lg font-bold text-white">N58</span>
                        </div>
                        <span className="text-2xl font-semibold tracking-tight">Nineteen58</span>
                    </div>
                    <p className="text-gray-500">AI-Powered Hiring Platform</p>
                </div>
                <SignIn
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "shadow-lg rounded-xl",
                            headerTitle: "text-xl font-bold",
                            headerSubtitle: "text-gray-500",
                            formButtonPrimary: "bg-black hover:bg-gray-800",
                        }
                    }}
                />
            </div>
        </div>
    )
}
