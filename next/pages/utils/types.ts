export interface User {
  id: string;
  username: string;
  devices: Device[];
}

export interface Device {
  credentialPublicKey: { [key: number]: number };
  credentialID: Uint8Array;
  counter: number;
  transports: any[]; // replace 'any' with the actual type if known
}

export interface Options {
  challenge: string;
  allowCredentials: Credential[];
  timeout: number;
  userVerification: string;
  rpId: string;
}

export interface Credential {
  id: string;
  type: string;
  transports: any[]; // replace 'any' with the actual type if known
}
