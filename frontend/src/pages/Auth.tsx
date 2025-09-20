import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters')
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

type SignUpData = z.infer<typeof signUpSchema>;
type SignInData = z.infer<typeof signInSchema>;

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const { signUp, signIn, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', fullName: '' }
  });

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' }
  });

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignUp = async (data: SignUpData) => {
    const { error } = await signUp(data.email, data.password, data.fullName);
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Account created! Please check your email to verify your account."
      });
    }
  };

  const handleSignIn = async (data: SignInData) => {
    const { error } = await signIn(data.email, data.password);
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? 'Sign up to start managing your finances with AI' 
              : 'Sign in to your finance dashboard'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSignUp ? (
            <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  {...signUpForm.register('fullName')}
                  placeholder="Enter your full name"
                />
                {signUpForm.formState.errors.fullName && (
                  <p className="text-sm text-destructive mt-1">
                    {signUpForm.formState.errors.fullName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...signUpForm.register('email')}
                  placeholder="Enter your email"
                />
                {signUpForm.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {signUpForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...signUpForm.register('password')}
                  placeholder="Enter your password"
                />
                {signUpForm.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {signUpForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={signUpForm.formState.isSubmitting}>
                {signUpForm.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          ) : (
            <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...signInForm.register('email')}
                  placeholder="Enter your email"
                />
                {signInForm.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {signInForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...signInForm.register('password')}
                  placeholder="Enter your password"
                />
                {signInForm.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {signInForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={signInForm.formState.isSubmitting}>
                {signInForm.formState.isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          )}
          
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;