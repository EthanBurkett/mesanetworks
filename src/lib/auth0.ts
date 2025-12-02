import { env } from "@/config/env";
import { AuthenticationClient } from "auth0";
import axios from "axios";

export namespace Auth0 {
  export const authentication = new AuthenticationClient({
    domain: env.AUTH0_DOMAIN,
    clientId: env.AUTH0_CLIENT_ID,
    clientSecret: env.AUTH0_CLIENT_SECRET,
  });
}

export const Auth0API = {
  async signup(data: {
    email: string;
    password: string;
    user_metadata?: Record<string, any>;
  }) {
    const response = await axios.post(
      `https://${env.AUTH0_DOMAIN}/dbconnections/signup`,
      {
        client_id: env.AUTH0_CLIENT_ID,
        email: data.email,
        password: data.password,
        connection: "Username-Password-Authentication",
        user_metadata: data.user_metadata,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  async getUserInfo(accessToken: string) {
    const response = await axios.get(`https://${env.AUTH0_DOMAIN}/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  async sendPasswordResetCode(email: string) {
    const response = await axios.post(
      `https://${env.AUTH0_DOMAIN}/passwordless/start`,
      {
        client_id: env.AUTH0_CLIENT_ID,
        client_secret: env.AUTH0_CLIENT_SECRET,
        connection: "email",
        email: email,
        send: "code",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  async sendEmailVerificationCode(email: string) {
    // Same as password reset - uses passwordless email with code
    return this.sendPasswordResetCode(email);
  },

  async verifyPasswordResetCode(email: string, code: string) {
    const response = await axios.post(
      `https://${env.AUTH0_DOMAIN}/oauth/token`,
      {
        grant_type: "http://auth0.com/oauth/grant-type/passwordless/otp",
        client_id: env.AUTH0_CLIENT_ID,
        client_secret: env.AUTH0_CLIENT_SECRET,
        username: email,
        otp: code,
        realm: "email",
        scope: "openid profile email",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  async verifyEmailCode(email: string, code: string) {
    // Verify the code, then mark email as verified in Auth0
    await this.verifyPasswordResetCode(email, code);

    const token = await this.getManagementToken();

    // Find user by email
    const usersResponse = await axios.get(
      `https://${env.AUTH0_DOMAIN}/api/v2/users-by-email`,
      {
        params: { email },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const user = usersResponse.data.find(
      (u: any) =>
        u.identities?.[0]?.connection === "Username-Password-Authentication"
    );

    if (!user) {
      throw new Error("User not found");
    }

    // Mark email as verified
    const response = await axios.patch(
      `https://${env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(
        user.user_id
      )}`,
      {
        email_verified: true,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  },

  async getManagementToken() {
    const response = await axios.post(
      `https://${env.AUTH0_DOMAIN}/oauth/token`,
      {
        grant_type: "client_credentials",
        client_id: env.AUTH0_CLIENT_ID,
        client_secret: env.AUTH0_CLIENT_SECRET,
        audience: `https://${env.AUTH0_DOMAIN}/api/v2/`,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.access_token;
  },

  async updateUserPassword(email: string, newPassword: string) {
    const token = await this.getManagementToken();

    // First, find the user by email in the Username-Password-Authentication connection
    const usersResponse = await axios.get(
      `https://${env.AUTH0_DOMAIN}/api/v2/users-by-email`,
      {
        params: { email },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const user = usersResponse.data.find(
      (u: any) =>
        u.identities?.[0]?.connection === "Username-Password-Authentication"
    );

    if (!user) {
      throw new Error(
        "User not found in Username-Password-Authentication connection"
      );
    }

    // Now update the password
    const response = await axios.patch(
      `https://${env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(
        user.user_id
      )}`,
      {
        password: newPassword,
        connection: "Username-Password-Authentication",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },
};
