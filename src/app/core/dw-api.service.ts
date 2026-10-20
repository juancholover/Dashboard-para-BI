import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  AvisosCoberturaDto,
  ComercialPlanDto,
  DatosComercial,
  DatosGerencia,
  GerenciaIngresosDto,
  GerenciaMembresiasDto,
  PromocionesClientesDto,
  PromocionesMembresiasDto,
  PromocionesVentasDto,
} from './kpi.models';

/** Acceso a los KPIs del Data Warehouse. Es la única capa que conoce las rutas de la API. */
@Injectable({ providedIn: 'root' })
export class DwApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBase;

  private listar<T>(ruta: string): Observable<T[]> {
    return this.http.get<T[]>(`${this.base}/${ruta}`);
  }

  /** Trae las tres fuentes del panel de Gerencia en una sola llamada lógica. */
  cargarGerencia(): Observable<DatosGerencia> {
    return forkJoin({
      ingresos: this.listar<GerenciaIngresosDto>('kpis/gerencia/ingresos'),
      membresias: this.listar<GerenciaMembresiasDto>('kpis/gerencia/membresias'),
      planes: this.listar<ComercialPlanDto>('kpis/comercial/planes'),
    });
  }

  /** Trae las cinco fuentes del panel de Administración y Comercial. */
  cargarComercial(): Observable<DatosComercial> {
    return forkJoin({
      planes: this.listar<ComercialPlanDto>('kpis/comercial/planes'),
      avisos: this.listar<AvisosCoberturaDto>('kpis/comercial/avisos-cobertura'),
      promosVentas: this.listar<PromocionesVentasDto>('kpis/comercial/promociones/ventas'),
      promosMembresias: this.listar<PromocionesMembresiasDto>('kpis/comercial/promociones/membresias'),
      promosClientes: this.listar<PromocionesClientesDto>('kpis/comercial/promociones/clientes'),
    });
  }
}
