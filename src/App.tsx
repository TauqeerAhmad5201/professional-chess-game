import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkle } from "@phosphor-icons/react"

function App() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Sparkle className="text-purple-600" size={48} weight="fill" />
                    </div>
                    <CardTitle className="text-2xl">Welcome to Spark!</CardTitle>
                    <CardDescription>
                        Your app is now running. Tell me what you'd like to build!
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <Button className="w-full">Get Started</Button>
                </CardContent>
            </Card>
        </div>
    )
}

export default App