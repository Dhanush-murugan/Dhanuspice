declare module "nodemailer" {
  export interface Transporter {
    sendMail(mailOptions: any, callback?: (err: any, info: any) => void): Promise<any>;
    verify(callback?: (err: any, success?: any) => void): Promise<any>;
  }

  export function createTransport(options?: any, defaults?: any): Transporter;
}
