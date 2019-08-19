export interface Dropdown {
  id: number,
  code: string,
  title: string,
  shortName: string,
  imageName: string,
  desc: string,
  webURL: string
}


export interface CountryDropdown {
  id: number,
  code: string,
  title: string,
  shortName: string,
  imageName: string,
  desc: any,
  webURL: string
}
export interface Country {
  CountryName?: string;
  CountryID: number;
  CountryPhoneCode: string;
  CountryCode: string;

}
