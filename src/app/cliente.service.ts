import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from './Cliente';
import { PageRequestDto } from './PageRequestDto';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  httpApiUrl: string = "http://127.0.0.1:9091/cliente-api";
  apiKey: string = "AIzaSyCsmRZMeiNPnJJN25m7ySSequQWIIql73Y";

  constructor(private http: HttpClient) { }

  salvar(cliente:Cliente) : Observable<Cliente> {
    return this.http.post<Cliente>(`${this.httpApiUrl}/clientes`,cliente);
  }

  clientes(pageRequestDto: PageRequestDto): Observable<any> {
    let params = new HttpParams();
    params = params.append('totalPorPagina', pageRequestDto.totalPorPagina);
    params = params.append('pagina', pageRequestDto.pagina);
    params = params.append('ordenacao', pageRequestDto.ordenacao);
    params = params.append('atributo', pageRequestDto.atributo);
    params = params.append('query', pageRequestDto.query);
    return this.http.get<any>(`${this.httpApiUrl}/clientes/page`, {params: params});
  }

  getCep(cep: string): Observable<any> {
    return this.http.get(`https://viacep.com.br/ws/${cep}/json/`);
  }

  excluir(id: number): Observable<any> {
    return this.http.delete(`${this.httpApiUrl}/clientes/${id}`);
  }

  buscarCliente(id: number): Observable<any> {
    return this.http.get(`${this.httpApiUrl}/clientes/buscar/${id}`);
  }
}
