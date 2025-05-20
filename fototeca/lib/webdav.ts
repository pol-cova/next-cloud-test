import { createClient } from 'webdav';

const NEXTCLOUD_URL = 'http://localhost:8080/remote.php/dav/files/root';
const NEXTCLOUD_USERNAME = 'root';
const NEXTCLOUD_PASSWORD = 'aRZTC-37KsF-Q26y7-4Pbi3-smL2C';

export const webdavClient = createClient(NEXTCLOUD_URL, {
    username: NEXTCLOUD_USERNAME,
    password: NEXTCLOUD_PASSWORD
}); 