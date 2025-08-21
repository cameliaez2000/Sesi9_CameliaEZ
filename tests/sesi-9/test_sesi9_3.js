// Import library dan modul yang diperlukan
import { Builder, By, until } from 'selenium-webdriver';
import assert from 'assert';
import chrome from 'selenium-webdriver/chrome.js';

// Blok describe() untuk mendeskripsikan test suite
describe('SauceDemo Test Suite', function () {
    // Deklarasi variabel driver di luar hook agar dapat diakses oleh semua test case
    let driver;

    // Hook: beforeEach dihapus karena login akan dilakukan di setiap test case
    beforeEach(async function () {
        // Konfigurasi opsi Chrome, seperti mode incognito
        let options = new chrome.Options();
        options.addArguments('--incognito'); // Opsi untuk menjalankan Chrome dalam mode incognito

        // Membangun instance driver
        driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    });

    // Hook: afterEach akan dijalankan setelah setiap test case selesai
    afterEach(async function () {
        // Memastikan driver ditutup setelah setiap tes untuk membersihkan sesi
        if (driver) {
            await driver.quit();
        }
    });

    // Test Case 1: Berhasil login dan memvalidasi elemen-elemen di home page
    it('Harus berhasil login dan memvalidasi elemen keranjang belanja dan judul halaman', async function () {
        // Navigasi ke URL dan lakukan proses login
        await driver.get('https://www.saucedemo.com');
        await driver.findElement(By.css('[data-test="username"]')).sendKeys('standard_user');
        await driver.findElement(By.xpath('//*[@data-test="password"]')).sendKeys('secret_sauce');
        await driver.findElement(By.className('submit-button btn_action')).click();

        // Menunggu elemen 'shopping-cart-link' muncul dan terlihat
        let buttonCart = await driver.wait(
            until.elementLocated(By.xpath('//*[@data-test="shopping-cart-link"]')),
            10000 // Timeout 10 detik
        );
        await driver.wait(until.elementIsVisible(buttonCart), 5000, 'Shopping cart harus tampil');

        // Assertion: Memastikan elemen keranjang belanja tampil
        await buttonCart.isDisplayed();

        // Mencari elemen logo aplikasi dan memvalidasi teksnya
        let textAppLogo = await driver.findElement(By.className('app_logo'));
        let logotext = await textAppLogo.getText();
        assert.strictEqual(logotext, 'Swag Labs');
    });

    // Test Case 2: Mengurutkan produk dari A-Z dan memvalidasi urutannya
    it('Harus mengurutkan produk dari A-Z dan memvalidasi urutannya', async function () {
        // Navigasi ke URL dan lakukan proses login
        await driver.get('https://www.saucedemo.com');
        await driver.findElement(By.css('[data-test="username"]')).sendKeys('standard_user');
        await driver.findElement(By.xpath('//*[@data-test="password"]')).sendKeys('secret_sauce');
        await driver.findElement(By.className('submit-button btn_action')).click();

        // Ambil daftar nama produk sebelum diurutkan
        let productNamesBeforeSort = await driver.findElements(By.className('inventory_item_name'));
        let namesBefore = await Promise.all(productNamesBeforeSort.map(async (element) => {
            return await element.getText();
        }));

        // Lakukan aksi untuk memilih opsi 'Name (A to Z)' dari dropdown
        let dropdown = await driver.findElement(By.className('product_sort_container'));
        await dropdown.findElement(By.xpath('//option[@value="az"]')).click();

        // Tunggu hingga halaman diperbarui
        await driver.sleep(5000); 

        // Ambil daftar nama produk setelah diurutkan
        let productNamesAfterSort = await driver.findElements(By.className('inventory_item_name'));
        let namesAfter = await Promise.all(productNamesAfterSort.map(async (element) => {
            return await element.getText();
        }));

        // Buat salinan dari daftar nama produk yang belum diurutkan dan urutkan secara manual untuk perbandingan
        let expectedSortedNames = [...namesBefore].sort();

        // Lakukan assertion untuk membandingkan daftar nama produk yang sebenarnya dengan yang diharapkan
        assert.deepStrictEqual(namesAfter, expectedSortedNames);

        console.log("Pengurutan produk berhasil!");
    });
});
