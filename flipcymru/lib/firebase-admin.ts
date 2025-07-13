import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

const firebaseAdminConfig = {
  type: "service_account",
  project_id: "flipcymru",
  private_key_id: "4cfd62ae491ddbe59989325001a2e9902bcffb88",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDTwx0YIwR8eSeA\ngrR+iVzRAOIeA5Sy9SZXObBgqB2Vm3MNFhmrsXkZI9Xlp+AUk1KXpxTFYjCmgawI\ngY8fDtGynOVrZUXnANPL5qH/4nEM6+w6+ETwcHXpdDhrpFyJlBAuECKTsCEgnWCl\nRpLxTRakkhkYpUXHDBk8RPmUHF/u68NdMo2kdHhqKyaTHBULdv2XJfUKNAZRSkaJ\nENfgQ4luXU/p6wLkC1tnroTWuZ1bsMBMAVTPeUFwPZBEaf+zgUV8sc5zMvKFJmo7\nwyctLctb4yTBsR6qzl8PHBTyxUmhaFYorUNMvszMm0LlmI8IzpkZJo9Std4hfFd5\nyVysnVLnAgMBAAECggEADZDt37p6kpjWYYK+Gm8lXZRfaAnVsGNJKgRdmsuaXZfA\nVqHIUjoD5ornrJdFITxQ6bs/9ucz867R/ReDujsiTv2DKw6pXEOuzdzAGxsAIBJL\nJ3n5PKgPvb1+0dKNRRkRsknBVVHOxX6fjucHCeNk5HUhm3UXE8ngIf7POGBa+vzM\nvdK55AXj8eynVQWZYBazUIMVjBy6ou+ow8c2hBIoBv6cQSNYNAPk2zJurSa8UOed\nKRlbhnRk/DDWEuuP8mRSHq0xhlD9YY00IIR61c72VLEGSxsvWm4YaJcrN/jVHBDu\nIGVe1vKk2PbJofiTbRPaHgq4sNOwV4H0JXsYb5Z5cQKBgQD2J9oEEEVvX2FNGIHs\nhfMYYYfcUM+GS02jQGO97euvBjJbgWY0+s2Kcav+eXlQPLpiJtAIM/8aV6dkmM2r\n/jXThL5fmQ7i5PA2DC1waTO+gRimVSSJhk3fywUU0Koii45lpcRvMAiF3//zlTEe\nf0Dut+fEAQfihyCum8QJcqf2kQKBgQDcOyPvJYdrWAGYQaBDEHh/xBcBNOjMgWFq\ndbT6xYRET0/7OORUfVd+hLPI0iyraK80+YiyuFKlJ6h6KLDaV4fW4YYYFdVsPjiZ\n+AAXosnnEmC0YNAdKz4i+GK997nVO9X25M293h+AHIYtJxyhbeJ3/b7LlyrBkvZP\nqoNsu6Ad9wKBgQDxCj8bwY8sqxqNsxTutpBAbKjsXZmJaM3isZe6EXO7lPbU0hZy\nhLGnAv6oFu1rW7wrhtQpZDlG41SAVnz4EdtFf/QniqqgFgz+79fC/tFzl9i6cB9y\nJ7i0D4qvQlGHuF69PKDpPADsj1eEf7B0q6m62Q0zysqc0TN4qAFEOykscQKBgE3e\nC0KPPmZR45519bhApppmNswSbQ2B4XPG0oqoM7ADawAkiXbmKn1tZjPnPCwPA4Pz\nhsXKLk5+yy8GHCHXOQxdCRCTB7cR+OlXqpCw2jp9YPvmDy+BDqNGt4L7iBVA5tI4\n7BXp57FgZICqh5D8TUqnyUIq3M88qyJX48gaPu7ZAoGBAOUVAz8crEsY4DV73JVU\nNDOajaI2XrWnv3+N82zVk28KYKe1VAGQKqNLl3KfJ4qBN6m+g7vmtyQgz+ms6Fq4\nqlaVAu4KpdyWagdDhcDoaRIRLR1BQ7szCZeq4eRNyZ493vufmYhaW/wJIu9T9ZJR\n6/bR+b2YuuCm++pVuR9tx4UH\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@flipcymru.iam.gserviceaccount.com",
  client_id: "115766775346871903534",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40flipcymru.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
}

// Initialize Firebase Admin SDK
const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert(firebaseAdminConfig),
        projectId: "flipcymru",
      })
    : getApps()[0]

export const adminAuth = getAuth(app)
export const adminDb = getFirestore(app)

// Helper functions for Firestore paths
export function getUserProfileDocRef(uid: string) {
  return adminDb.collection(`artifacts/default-app-id/users/${uid}/userProfile`).doc("data")
}

export function getFlashcardsCollectionRef(uid: string) {
  return adminDb.collection(`artifacts/default-app-id/users/${uid}/flashcards`)
}

export function getFlashcardCategoriesCollectionRef(uid: string) {
  return adminDb.collection(`artifacts/default-app-id/users/${uid}/flashcardCategories`)
}

export function getTranslationHistoryCollectionRef(uid: string) {
  return adminDb.collection(`artifacts/default-app-id/users/${uid}/translationHistory`)
}
