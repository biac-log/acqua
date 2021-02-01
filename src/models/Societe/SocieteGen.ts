import { SocieteModule } from '@/store/modules/companies';

export class SocieteGen {
  path = '';
  created = false;
  error = '';

  constructor(path: string) {
    this.path = path;
    this.created = SocieteModule.societes.some(
      (s) => (s.name.toLowerCase() || s.identifiant.toLowerCase()) == this.identifiant
    );
  }

  get identifiant() {
    const array = this.path.split('\\');
    return array.last().toLowerCase();
  }
}
