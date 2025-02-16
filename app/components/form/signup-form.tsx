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
import { IsDefined, IsEmail, MinLength } from 'class-validator'
import { useForm } from 'react-hook-form'
import { classValidatorResolver } from '@hookform/resolvers/class-validator'
import { useCallback } from "react"
import ErrorMessage from "./error-message"
import { useMutation } from "@tanstack/react-query"
import { supabase } from "~/supabase"
import { useNavigate } from "react-router"

class SignupFormData {
  @IsDefined()
  @IsEmail()
  email: string

  @IsDefined()
  @MinLength(8)
  password: string
}

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate()

  const { register, handleSubmit, formState } = useForm<SignupFormData>({
    resolver: classValidatorResolver(SignupFormData)
  })

  const { mutate: signUp, isPending } = useMutation({
    mutationKey: ['signup'],
    mutationFn: (data: SignupFormData) => {
      return supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })
    },
    onSuccess: (res) => {
      navigate('/auth/login')
    }
  })

  const onSubmit = useCallback((data: SignupFormData) => {
    signUp(data)
  }, [])

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Register</CardTitle>
          <CardDescription>
            Register your account
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  {...register('password')}
                />
                <ErrorMessage name="password" formState={formState} />
              </div>
              <Button type="submit" className="w-full" loading={isPending}>
                Register
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
