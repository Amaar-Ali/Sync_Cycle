import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Chrome } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Footer from '@/components/Footer';

const Login = () => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      toast({
        title: "Success",
        description: "Successfully signed in with Google!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (isSignUp && !formData.name) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      if (isSignUp) {
        await signUpWithEmail(formData.email, formData.password, formData.name);
        toast({
          title: "Success",
          description: "Account created successfully!",
        });
      } else {
        await signInWithEmail(formData.email, formData.password);
        toast({
          title: "Success",
          description: "Successfully signed in!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isSignUp ? 'sign up' : 'sign in'}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="flex-grow-1 d-flex align-items-center justify-content-center">
        <div className="bg-white rounded-4 shadow p-4 p-md-5 mx-3 mx-md-0" style={{ maxWidth: "450px" }}>
          <div className="text-center mb-4">
            <h1 className="fs-2 fw-bold text-dark mb-2">Period Tracker</h1>
            <p className="text-secondary">Track your cycle with confidence</p>
          </div>

          <form onSubmit={handleEmailAuth} className="mb-4">
            {isSignUp && (
              <div className="mb-3">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required={isSignUp}
                  className="form-control"
                />
              </div>
            )}
            
            <div className="mb-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="form-control"
              />
            </div>
            
            <div className="mb-4">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="form-control"
              />
            </div>

            <Button 
              type="submit" 
              className="w-100 btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Button>
          </form>

          <div className="position-relative mb-4">
            <hr className="my-4" />
            <div className="position-absolute top-50 start-50 translate-middle bg-white px-3">
              <span className="text-secondary small">Or continue with</span>
            </div>
          </div>

          <Button
            onClick={handleGoogleSignIn}
            className="w-100 d-flex align-items-center justify-content-center gap-2 btn btn-outline-secondary"
            variant="outline"
            disabled={loading}
          >
            <Chrome className="h-5 w-5" />
            Continue with Google
          </Button>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="btn btn-link text-decoration-none"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          <p className="small text-secondary text-center mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
