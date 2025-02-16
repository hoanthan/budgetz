import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Link, useNavigate } from "react-router"
import { IsDefined, IsEmail, MinLength } from "class-validator"
import { useForm } from "react-hook-form"
import { classValidatorResolver } from "@hookform/resolvers/class-validator"
import { useCallback } from "react"
import ErrorMessage from "./error-message"
import { useMutation } from "@tanstack/react-query"
import { supabase } from "~/supabase"
import { useAuth } from "~/store/auth"

class LoginFormData {
  @IsDefined()
  @IsEmail()
  email: string

  @IsDefined()
  @MinLength(8)
  password: string
}

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate()

  const setSession = useAuth(state => state.setSession)

  const { register, handleSubmit, formState } = useForm<LoginFormData>({
    resolver: classValidatorResolver(LoginFormData),
  })

  const { mutate: login, isPending } = useMutation({
    mutationKey: ['login'],
    mutationFn: (data: LoginFormData) => supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    }),
    onSuccess: (res) => {
      setSession(res.data.session)
      navigate('/')
    }
  })

  const onSubmit = useCallback((data: LoginFormData) => {
    login(data)
  }, [])

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register('email')}
                />
                <ErrorMessage name="email" formState={formState} />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" placeholder="********" {...register('password')} />
                <ErrorMessage name="password" formState={formState} />
              </div>
              <Button type="submit" className="w-full" loading={isPending}>
                Login
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/auth/register" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
