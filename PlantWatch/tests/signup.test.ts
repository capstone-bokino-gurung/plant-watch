import { signUp, signIn } from "@/services/auth";
import { supabase } from "@/util/supabase";

jest.mock("@/util/supabase", () => ({
    supabase: {
        auth: {
            signUp: jest.fn(),
            signIn: jest.fn(),
        },
    },
}));

describe("<Signup />", () => {
    test("should sign up a new user successfully", async () => {
        const mockEmail = "user@example.com";
        const mockPassword = "password123";
        (supabase.auth.signUp as jest.Mock).mockResolvedValue({
            data: {
                session: { access_token: 'abc123' },
                user: { email: mockEmail },
            },
            error: null,
        });

        const result = await signUp(mockEmail, mockPassword, 'John', 'Doe');
        expect(supabase.auth.signUp).toHaveBeenCalledWith({ 
            email: mockEmail, 
            password: mockPassword,
            options: {
                data: {
                    first_name: 'John',
                    last_name: 'Doe',
                },
            },
            });
        expect(result).toEqual({ 
            session: { access_token: 'abc123' },
            error: null });
    });
});