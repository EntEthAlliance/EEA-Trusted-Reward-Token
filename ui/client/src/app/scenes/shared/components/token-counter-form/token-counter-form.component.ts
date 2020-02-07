import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AuthService } from '@eea/core/auth/auth.service';
import { MaskPatterns } from '@eea/shared/masks/validation-mask';
import { MemberApiService } from '../../../member/api/member-api.service';
import { MemberModel } from '../../../member/models/member.model';

export interface UserBalance {
  EEAReputation: number;
  EEAReward?: number;
}

export interface RedeemListItem {
  id: number;
  name: string;
  tokencount: number;
}

@Component({
  selector: 'eea-token-counter-form',
  templateUrl: './token-counter-form.component.html',
  styleUrls: ['./token-counter-form.component.scss'],
})
export class TokenCounterFormComponent implements OnInit {
  @Output() save = new EventEmitter<{ id: number; count: number }>();
  @Output() clearErrorState = new EventEmitter();

  private _loading: boolean;
  @Input()
  set loading(value: boolean) {
    if (value !== undefined) {
      this._loading = value;
      if (value === false && this.error === undefined) {
        this.isRequestSuccessful();
      }
    }
  }

  get loading() {
    return this._loading;
  }

  private _type: string;
  @Input()
  set type(value: string) {
    if (value) {
      this._type = value;
      this.currentTabType = this.tabSet[value];
      this.getType ? this.getMembersList() : this.getRedeemForList();
    }
  }

  get type() {
    return this._type;
  }

  private _error: string;
  @Input()
  set error(value: string) {
    if (value) {
      this._error = value;
      this.loading = false;
    }
  }

  get error() {
    return this._error;
  }

  selectData: RedeemListItem[] | MemberModel[];
  form: FormGroup;
  userBalance: UserBalance;

  currentTabType: {
    formTitle: '';
    formLabel: string[];
    formBtnTitle: '';
    formSelectDisabled: '';
    successMessage: '';
    successBtn: '';
  };

  tabSet = {
    redeem: {
      formTitle: 'EEA Tokens will be redeemed',
      formLabel: ['Redeem For', 'Quantity'],
      formBtnTitle: 'Redeem',
      formSelectDisabled: 'Select option',
      successMessage: 'Redemption request was created successfully',
      successBtn: 'New Redeem',
    },
    share: {
      formTitle: 'You are going to share',
      formLabel: ['EEA Member', 'EEA Tokens'],
      formBtnTitle: 'Share',
      formSelectDisabled: 'Select EEA member',
      successMessage: 'Share request was made successfully',
      successBtn: 'New Share',
    },
  };

  currentUserBalance$: Observable<UserBalance>;
  isStaticOptionSelected = true;
  numbersOnlyInput = MaskPatterns.NUMBERS_ONLY;
  isRequestDone = false;

  constructor(
    private fb: FormBuilder,
    private memberApi: MemberApiService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      userSelect: ['', [Validators.required]],
      count: ['', [Validators.required]],
    });
    this.getBalance();
  }

  getBalance() {
    this.currentUserBalance$ = this.memberApi.getBalance().pipe(
      tap((balance: UserBalance) => {
        this.userBalance = balance;
      })
    );
  }

  get getType() {
    return this.type && this.type === 'share';
  }

  get getCurrentBalance() {
    const value = this.form.value;
    if (this.userBalance && +this.userBalance.EEAReward > 0) {
      return this.type === 'redeem' ? this.countRedeem(value) : this.countShare(value);
    }
    return 0;
  }

  isRequestSuccessful() {
    if (this.loading === false) {
      this.clearForm();
      this.isRequestDone = true;
      if (this.type === 'share') {
        this.getBalance();
      }
    }
  }

  countRedeem(value) {
    const currentToken = !value.userSelect ? 0 : value.userSelect.tokencount;
    return +this.userBalance.EEAReward - currentToken * +value.count;
  }

  countShare(value) {
    const currentToken = +value.count || 0;
    return +this.userBalance.EEAReward - +currentToken;
  }

  get isTokenInputValid() {
    return this.getCurrentBalance >= 0 && this.userBalance.EEAReward !== 0;
  }

  getRedeemForList() {
    this.memberApi
      .getRedeemForList()
      .subscribe(
        (data: RedeemListItem[]) =>
          (this.selectData = data.sort((a, b) => a.tokencount - b.tokencount))
      );
  }

  getMembersList() {
    this.memberApi
      .getMembers()
      .subscribe(
        data =>
          (this.selectData = data
            .sort((a, b) => a.id - b.id)
            .filter(el => el.id !== this.auth.user._id))
      );
  }

  onSelect() {
    this.isStaticOptionSelected = this.isStaticOptionSelected !== false && false;
  }

  saveData() {
    this.save.emit({ id: +this.form.value.userSelect.id, count: +this.form.value.count });
  }

  clearForm() {
    if (this.isStaticOptionSelected !== true) {
      this.form.reset();
      this.isStaticOptionSelected = true;
    } else if (this.form.controls.count.value) {
      this.form.controls.count.setValue('');
    }
    this.clearErrorState.emit();
  }

  onRefreshFormEvent() {
    this.isRequestDone = false;
  }
}
