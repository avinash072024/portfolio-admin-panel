export class Constants {
    public static APP_NAME1: string = 'Admin';
    public static APP_NAME2: string = 'Portal';
    public static APP_NAME_COMBINE: string = this.APP_NAME1 + '-' + this.APP_NAME2;
    public static APP_NAME: string = this.APP_NAME1 + ' ' + this.APP_NAME2;
    public static THEME_KEY: string = (this.APP_NAME_COMBINE + '-' + 'theme').toLowerCase();
    public static SKIN_KEY: string = (this.APP_NAME_COMBINE + '-' + 'skin').toLowerCase();

    // user details
    public static USER_DETAILS: string = 'userDetails';
    public static PROJECT_IMAGE_URL: string = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800';
}
