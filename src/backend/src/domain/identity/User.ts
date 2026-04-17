type UserProps = {
  id?: string;
  email: string;
  name: string;
  passwordHash: string;
};

export class User {
  constructor(private readonly props: UserProps) {}

  get id(): string | undefined {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }
}
