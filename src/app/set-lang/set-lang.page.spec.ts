import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SetLangPage } from './set-lang.page';

describe('SetLangPage', () => {
  let component: SetLangPage;
  let fixture: ComponentFixture<SetLangPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SetLangPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
