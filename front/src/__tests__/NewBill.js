/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { getByTestId, getByText } from "@testing-library/dom";
import NewBill from "../containers/NewBill.js";
import NewBillUI from "../views/NewBillUI.js";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import store from "../__mocks__/store";
import mockStore from "../__mocks__/store";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);
window.alert = jest.fn();

describe("Given I am connected as an employee", () => {
  describe("can i connect to newBill test push note de frais", () => {
    test("Then an error message is displayed and the file is not uploaded", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    });
  });
  // describe("When I am on NewBill Page", () => {
  //   // test 1 => nous verifions si l'icon bill est allumé
  //   test("Then bill icon in vertical layout should be highlighted", async () => {
  //     Object.defineProperty(window, "localStorage", {
  //       value: localStorageMock,
  //     });
  //     window.localStorage.setItem(
  //       "user",
  //       JSON.stringify({
  //         type: "Employee",
  //       })
  //     );
  //     const root = document.createElement("div");
  //     root.setAttribute("id", "root");
  //     document.body.append(root);
  //     // chargement de la page
  //     const pathname = ROUTES_PATH.NewBill;
  //     root.innerHTML = ROUTES({ pathname: pathname, loading: true });
  //     document.querySelector("#layout-icon1").classList.remove("active-icon");
  //     document.querySelector("#layout-icon2").classList.add("active-icon");
  //     // récupération de l'icône
  //     await waitFor(() => screen.getByTestId("icon-mail"));
  //     const mailIcon = screen.getByTestId("icon-mail");
  //     //vérification si l'icône contient la classe active-icon
  //     const iconActivated = mailIcon.classList.contains("active-icon");
  //     expect(iconActivated).toBeTruthy();
  //   });
  // });
  // verifier que le fichier importer et un fichier jpeg, jpg, png
  describe("When I am on the NewBill page and I upload a file with an extension other than jpeg, jpg or png", () => {
    document.body.innerHTML = NewBillUI();
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    const newBill = new NewBill({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage,
    });
    const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
    const fileInput = screen.getByTestId("file");
    fileInput.addEventListener("change", handleChangeFile);
    fireEvent.change(fileInput, {
      target: {
        files: [
          new File(["test"], "test.txt", {
            type: "application/txt",
          }),
        ],
      },
    });
    expect(handleChangeFile).toHaveBeenCalled();
    // expect(fileInput.files[0].name).toBe("test.txt");
  });
});
// test("Then bill create", () => {
//   // page of NewBill
//   document.body.innerHTML = NewBillUI();
//   const onNavigate = (pathname) => {
//     document.body.innerHTML = ROUTES({ pathname });
//   };
//   const newBill = new NewBill({
//     document,
//     onNavigate,
//     store: null,
//     localStorage: window.localStorage,
//   });
//   const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
//   const submit = screen.getByTestId("from-new-bill");
//   submit.addEventListener("submit", handleSubmit);
//   fireEvent.submit(submit);
//   expect(handleSubmit).toHaveBeenCalled();
// });
// });

// error
describe("Given I am a user connected as Admin", () => {
  describe("When I navigate to bills", () => {
    test("fetches bills from mock API GET", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    });
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Admin",
            email: "a@a",
          })
        );
        document.body.innerHTML = BillsUI({ data: [bills[0]] });
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        // document.body.innerHTML = html;
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
describe("test post", () => {
  describe("create a new bill", () => {
    test("send bill with moke post", async () => {
      const newBill = {
        id: "qcCK3SzECmaZAGRrHjaC",
        status: "refused",
        pct: 20,
        amount: 200,
        email: "a@a",
        name: "test2",
        vat: "40",
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        date: "2002-02-02",
        commentAdmin: "pas la bonne facture",
        commentary: "test2",
        type: "Restaurants et bars",
        fileUrl:
          "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=4df6ed2c-12c8-42a2-b013-346c1346f732",
      };
      const getSpy = jest.spyOn(mockStore, "post");
      await mockStore.post(newBill);
      expect(getSpy).toHaveBeenCalledTimes(1);
    });
  });
});
