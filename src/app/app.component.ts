import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

export type MonthFinance = {
  totalAmbassadors: number;
  newLocals: number;
  totalLocals: number;
  revenue: number;
  moneyForBonus: number;
  moneyForFees: number;
  moneyForQR: number;
  totalExpenses: number;
  net: number;
}

export type FinanceForm = {
  ambassadorCount: number;
  ambassadorGrowth: number;
  initialTotalLocals: number;
  newLocalsPerMonthPerAmbassador: number;
  comebackPricePerLocal: number;
  feePercentage: number;
  feeForMonths: number;
  initialCostPerLocal: number;
  bonusPerNewLocalePerAmbassador: number;
  freeMonths: number;
  prospectMonths: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public title = 'cb-finance';
  public businessPlanForm = this.fb.group({
    ambassadorCount: [10, Validators.required],
    ambassadorGrowth: [0, Validators.required],
    initialTotalLocals: [0, Validators.required],
    newLocalsPerMonthPerAmbassador: [10, Validators.required],
    comebackPricePerLocal: [49, Validators.required],
    feePercentage: [50, Validators.required],
    feeForMonths: [6, Validators.required],
    initialCostPerLocal: [25, Validators.required],
    bonusPerNewLocalePerAmbassador: [100, Validators.required],
    freeMonths: [1, Validators.required],
    prospectMonths: [36, Validators.required],
  });
  public prospectData: MonthFinance[] = [];

  constructor(private fb: FormBuilder) {
  }

  public generateFinanceProspect(): void {
    const forMonths = this.getKeyValue('prospectMonths');
    let data: MonthFinance[] = [];
    for (let i  = 0; i < forMonths; i++) {
      const monthFinance = this.getMonthData([...data]);
      data.push(monthFinance);
    }
    this.prospectData = data;
  }

  private getMonthData(currentData: MonthFinance[]): MonthFinance {
    const financeForm: FinanceForm = this.businessPlanForm.getRawValue();

    let totalAmbassadors = financeForm.ambassadorCount;
    let newLocals = financeForm.newLocalsPerMonthPerAmbassador * totalAmbassadors;
    let totalLocals = newLocals
    let revenue = financeForm.comebackPricePerLocal * (totalLocals);
    let moneyForBonus = financeForm.bonusPerNewLocalePerAmbassador * newLocals;
    const feePercentage = financeForm.feePercentage ? (financeForm.feePercentage / 100) : 0;
    let moneyForFees = feePercentage * financeForm.comebackPricePerLocal * newLocals;
    let moneyForQR = financeForm.initialCostPerLocal * newLocals;
    let totalExpenses = moneyForBonus + moneyForFees + moneyForQR;
    let net = revenue - totalExpenses;

    if (currentData.length) {
      const prevMonth: MonthFinance = currentData[currentData.length - 1];
      const ambassadorGrowth = financeForm.ambassadorGrowth ? (financeForm.ambassadorGrowth / 100) : 0;
      totalAmbassadors = totalAmbassadors + (ambassadorGrowth * totalAmbassadors);
      newLocals = financeForm.newLocalsPerMonthPerAmbassador * totalAmbassadors;
      totalLocals = prevMonth.totalLocals + newLocals;
      revenue = financeForm.comebackPricePerLocal * (totalLocals);
      moneyForBonus = financeForm.bonusPerNewLocalePerAmbassador * newLocals;
      moneyForFees = feePercentage * financeForm.comebackPricePerLocal * newLocals;

      if (currentData.length < financeForm.feeForMonths) {
        currentData.forEach((month: MonthFinance) => {
          moneyForFees = moneyForFees + (feePercentage * (month.newLocals * financeForm.comebackPricePerLocal));
        });
      } else {
        let monthsReversed = currentData.reverse().slice(0, financeForm.feeForMonths);
        monthsReversed.forEach((month: MonthFinance) => {
          moneyForFees = moneyForFees + (feePercentage * (month.newLocals * financeForm.comebackPricePerLocal));
        });
      }

      moneyForQR = financeForm.initialCostPerLocal * newLocals;
      totalExpenses = moneyForBonus + moneyForFees + moneyForQR;
      net = revenue - totalExpenses;
    }

    return { totalAmbassadors, newLocals, totalLocals, revenue, moneyForBonus, moneyForFees, moneyForQR, totalExpenses, net };
  }

  private getKeyValue(key: string): number {
    return this.businessPlanForm.getRawValue()[key];
  }
}
