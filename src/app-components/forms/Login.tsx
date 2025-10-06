import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLoginMutation } from "../../api/auth";
import Spinner from "../common/Spinner";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useLoginMutation(setApiError);

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-primary/10 shadow-xl backdrop-blur-lg border border-slate-200/60 p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-full flex items-center justify-center mb-3">
              <img
                src="/src/assets/images/optiman-logo.png"
                alt="Optiman Logo"
                className="w-[110px] h-[18px] object-cover"
              />
            </div>
            <p className="text-slate-600 text-xs font-medium">
              Sign in to your Optiman account
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-[11px] font-medium text-slate-700"
                >
                  Username
                </label>
                <input
                  {...register("username")}
                  type="text"
                  className="input-style"
                  placeholder="Enter Username"
                />
                {errors.username && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-[11px] font-medium text-slate-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    className="input-style"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-[11px] text-red">
                    {errors.password.message}
                  </p>
                )}
              </div>
              {apiError && (
                <p className="mt-1 text-[11px] text-red">{apiError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-[9px] text-[13px] font-semibold px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? (
                <div className="flex items-center justify-center">
                  <Spinner
                    size="w-5 h-5"
                    color="border-white"
                    borderSize="border-2"
                  />
                </div>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
          <div className="mt-4 text-center text-xs text-slate-500">
            ©copyright 2025{" "}
            <span className="text-primary font-semibold">EPTeck</span> - All
            Rights Reserved
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
