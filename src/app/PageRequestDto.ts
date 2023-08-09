export class PageRequestDto {
  pagina: number = 0;
  ordenacao: string = "desc";
  atributo: string = "id";
  query: string = "";
  totalPorPagina: number = 10;
}
