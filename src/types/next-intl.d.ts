import type bg from '../../messages/bg.json';

type Messages = typeof bg;

declare global {
  interface IntlMessages extends Messages {}
}