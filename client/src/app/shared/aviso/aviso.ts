import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type TipoAviso = 'info' | 'exito' | 'error';

const ICONOS: Record<TipoAviso, string> = {
  info: 'info',
  exito: 'check_circle',
  error: 'error',
};

@Component({
  selector: 'app-aviso',
  imports: [MatIconModule],
  host: {
    class: 'd-flex align-items-start gap-2 p-3 rounded-4',
    '[class]': '"aviso-" + tipo()',
    '[attr.role]': 'tipo() === "error" ? "alert" : "status"',
  },
  templateUrl: './aviso.html',
  styleUrl: './aviso.scss',
})
export class Aviso {
  readonly tipo = input<TipoAviso>('info');
  protected readonly icono = computed(() => ICONOS[this.tipo()]);
}
