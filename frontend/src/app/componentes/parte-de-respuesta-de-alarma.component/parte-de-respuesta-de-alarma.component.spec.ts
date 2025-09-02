import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParteDeRespuestaDeAlarmaComponent } from './parte-de-respuesta-de-alarma.component';

describe('ParteDeRespuestaDeAlarmaComponent', () => {
  let component: ParteDeRespuestaDeAlarmaComponent;
  let fixture: ComponentFixture<ParteDeRespuestaDeAlarmaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParteDeRespuestaDeAlarmaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParteDeRespuestaDeAlarmaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
