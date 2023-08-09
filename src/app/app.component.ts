import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ClienteService } from './cliente.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Cliente } from './Cliente';
import Swal from 'sweetalert2';
import { PageRequestDto } from './PageRequestDto';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  typeQuery = 'number';
  titleSpanNavBar = "";
  msgAguarde = "Por Favor Aguarde...";
  msgTupoPronto = "Tudo Pronto!";
  submitted = false;
  title = 'ClienteFront';
  cliente: Cliente;
  errors: [] = [];
  digitandoEndereco: string = '';
  resultadosDigitado?: google.maps.GeocoderResult[] | null;
  form: FormGroup = new FormGroup({});
  latitude: number = -16.7008956;
  longitude: number = -49.2534187;
  markerPositions: google.maps.LatLngLiteral[] = [];
  markerOptions: google.maps.MarkerOptions = {
    draggable: true,
    title: 'Localização marcada'
  };
  markerPosition: google.maps.LatLngLiteral = {
    lat: this.latitude,
    lng: this.longitude
  };
  clientes: Cliente[] = [];
  pageRequestDto: PageRequestDto = new PageRequestDto();
  colunas = [
    { name: "-Id", value: 'id'},
    { name: "-Código", value: 'codigo'},
    { name: "-Nome", value: 'nome'},
    { name: "-Cnpj", value: 'cnpj'},
    { name: "-Cep", value: 'cep'},
    { name: "-Logradouro", value: 'logradouro'},
    { name: "-Geolocalização", value: 'geolocalizacao'},
  ]
  ordenacoes = [
    { name: "DESC", value: 'desc' },
    { name: "ASC", value: 'asc' },
  ]
  arrayPaginas = [
    { label:'1', value: 1 },
    { label:'2', value: 2 },
    { label:'3', value: 3 },
    { label:'5', value: 5 },
    { label:'10', value: 10 },
  ]

  totalPorPagina: number = 10;
  colunaSelecionada: string = "id";
  ordenacaoSelecionada: string = "desc";
  query: string = "";

  constructor(
    private formBuilder: FormBuilder,
    private service : ClienteService,
    private router : Router,
    private activatedRoute: ActivatedRoute)
  {
    this.cliente = new Cliente();
    this.markerPositions.push(this.markerPosition);

  }

  ngOnInit(): void {
    this.form = this.formBuilder.group(
      {
        nome: [null,[Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
        cnpj: [null, [Validators.required]],
        cep: [null, Validators.minLength(4)],
        logradouro: [null, [Validators.required]],
        geolocalizacao: [null, [Validators.required]],
        codigo:[null],
      }
    );

    this.pageRequestDto.pagina = 0;
    this.pageRequestDto.totalPorPagina = this.totalPorPagina;
    this.pageRequestDto.atributo = this.colunaSelecionada;
    this.pageRequestDto.ordenacao = this.ordenacaoSelecionada;

    this.buscarClientes();
  }

  buscarClientes() {
    this.service.clientes(this.pageRequestDto).subscribe({
      next: response => {
        this.titleSpanNavBar = this.msgAguarde;
        this.clientes = response.content;
      }, complete: () => {
        this.titleSpanNavBar = this.msgTupoPronto;
      }, error: responseError => {
        this.titleSpanNavBar = this.msgTupoPronto;
        if(responseError.error && responseError.error.length > 0) {
          console.log(responseError.error)
          for(let i = 0 ; i < responseError.error.length; i++) {
            this.messageWarning(responseError.error[i].message);
          }
        } else {
          this.messageWarning(responseError.error.message);
        }
      },
    });
  }

  filtrarClientes() {
    this.pageRequestDto.pagina = 0;
    this.pageRequestDto.atributo = this.colunaSelecionada;
    this.pageRequestDto.ordenacao = this.ordenacaoSelecionada;
    this.pageRequestDto.query = this.query;
    this.buscarClientes();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  public onSubmit(): void {
    this.submitted = true;
    this.titleSpanNavBar = this.msgAguarde;
    if (this.form.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'Preencha todos os campos solicitados!',
      });
      this.titleSpanNavBar = this.msgTupoPronto;
      return;
    }
    this.cliente = {...this.cliente,...this.form.value}

    this.service.salvar(this.cliente).subscribe({
      next: (value) => {
        this.limparCampos();
        this.buscarClientes();
        Swal.fire({
          icon: 'success',
          title: `Registro salvo com sucesso!`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 8000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        });
      },
      complete: () => {
        this.titleSpanNavBar = this.msgTupoPronto;
      },
      error: responseError => {
        this.titleSpanNavBar = this.msgTupoPronto;
        console.log(responseError.error);
        if(responseError.error && responseError.error.length > 0) {
          for(let i = 0 ; i < responseError.error.length; i++) {
            this.messageWarning(responseError.error[i].message);
          }
        } else {
          this.messageWarning(responseError.error.message);
        }
      },
    });
  }

  limparCampos() {
    this.form.reset();
    this.digitandoEndereco = '';
    this.latitude = -16.7008956;
    this.longitude = -49.2534187;
    this.markerPositions = [];
    this.markerPosition.lat = this.latitude;
    this.markerPosition.lng = this.longitude
    this.markerPositions.push(this.markerPosition);
    this.form.setErrors(null);
    this.form.updateValueAndValidity();
    this.submitted = false;
    this.resultadosDigitado = [];
    this.cliente = new Cliente();
  }

  buscarCep(): void {
    let cep = this.form.get('cep')?.value;
    if(cep) {
      cep = cep.replace("-","");
      this.service.getCep(cep).subscribe({
        next: response => {
          console.log(response);
          this.form.patchValue({'logradouro':response.localidade+', '+response.bairro+', '+response.logradouro});
        },
        complete: () =>  {
          console.log("OK");
        },
        error: responseError => {
          console.log(responseError);
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'Para fazer a busca, digite o CEP!',
      });
    }
  }

  onInputChange() {
    if (this.digitandoEndereco === '') {
      this.resultadosDigitado = [];
      return;
    }
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: this.digitandoEndereco }, (results, status) => {
      if (status === 'OK') {
        this.resultadosDigitado = results;
      } else {
        this.resultadosDigitado = [];
      }
    });
  }

  enderecoSelecionado(address: google.maps.GeocoderResult) {
    this.form.patchValue({'cep': null});
    for(let i = 0; i < address.address_components.length; i ++) {
      if(address.address_components[i].types[0] === 'postal_code') {
        this.form.patchValue({'cep': address.address_components[i].long_name});
      }
    }
    if(!this.form.get('cep')?.value) {
      this.messageWarning('Esse endereço não possui CEP!');
    }
    this.latitude = address.geometry.location.lat();
    this.longitude = address.geometry.location.lng();
    this.markerPositions = [];
    const geolocalizacao = address.geometry.location.toJSON();
    this.markerPositions.push(geolocalizacao);
    this.digitandoEndereco = address.formatted_address;
    this.form.patchValue({'logradouro': address.formatted_address});
    this.form.patchValue({'geolocalizacao': geolocalizacao.lat+','+geolocalizacao.lng});
    this.resultadosDigitado = [];
  }

  addMarcador(event: google.maps.MapMouseEvent) {
    if(event.latLng != null) {
      this.markerPositions = [];
      this.markerPositions.push(event.latLng.toJSON());
    }
  }

  mapDragend($event: any) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: $event.latLng.lat()+','+$event.latLng.lng() }, (results, status) => {
      if (status === 'OK') {
        this.resultadosDigitado = results;
      } else {
        this.resultadosDigitado = [];
      }
    });
  }

  buscarCliente(id: any): void {
    this.service.buscarCliente(id).subscribe({
      next: response => {
        this.titleSpanNavBar = this.msgAguarde;
        this.cliente = response;
        if(this.cliente) {
          this.form.patchValue({'id':this.cliente.id});
          this.form.patchValue({'codigo':this.cliente.codigo});
          this.form.patchValue({'nome':this.cliente.nome});
          this.form.patchValue({'cnpj':this.cliente.cnpj});
          this.form.patchValue({'logradouro':this.cliente.logradouro});
          this.form.patchValue({'cep':this.cliente.cep});
          this.form.patchValue({'geolocalizacao':this.cliente.geolocalizacao});
          this.latitude = Number(this.cliente.geolocalizacao?.split(',')[0]);
          this.longitude = Number(this.cliente.geolocalizacao?.split(',')[1]);
          this.markerPosition.lat = this.latitude;
          this.markerPosition.lng = this.longitude;
          this.markerPositions.push(this.markerPosition);
        }
      }, complete: () => {
        this.titleSpanNavBar = this.msgTupoPronto;
      }, error: responseError => {
        this.titleSpanNavBar = this.msgTupoPronto;
        if(responseError.error && responseError.error.length > 0) {
          console.log(responseError.error)
          for(let i = 0 ; i < responseError.error.length; i++) {
            this.messageWarning(responseError.error[i].message);
          }
        } else {
          this.messageWarning(responseError.error.message);
        }
      },
    });
  }

  excluir(id: any): void {
    Swal.fire({
      title: 'Tem certeza?',
      text: "Você não será capaz de reverter isso!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, apague!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.excluir(id).subscribe({
          next: (value) => {
            this.limparCampos();
            this.buscarClientes();
            this.messageSucesso("Exclusão realizada com sucesso!");
          },
          complete: () => {
            this.titleSpanNavBar = this.msgTupoPronto;
          },
          error: responseError => {
            this.titleSpanNavBar = this.msgTupoPronto;
            if(responseError.error && responseError.error.length > 0) {
              for(let i = 0 ; i < responseError.error.length; i++) {
                this.messageWarning(responseError.error[i].message);
              }
            } else {
              this.messageWarning(responseError.error.message);
            }
          },
        });
      }
    })
  }

  mudarTypeQuery(): void {
    if(this.colunaSelecionada !== 'id') {
      this.typeQuery = "text";
    } else {
      this.typeQuery = "number";
    }
  }

  onChangePagina(): void {
    this.pageRequestDto.pagina = 0;
    this.pageRequestDto.totalPorPagina = this.totalPorPagina;
    this.pageRequestDto.atributo = this.colunaSelecionada;
    this.pageRequestDto.ordenacao = this.ordenacaoSelecionada;
    this.buscarClientes();
  }

  messageWarning(message: string): void {
    Swal.fire({
      icon: 'warning',
      title: `${message}`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 8000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
  }

  messageSucesso(message: string): void {
    Swal.fire({
      icon: 'success',
      title: `${message}`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 8000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
  }

}
