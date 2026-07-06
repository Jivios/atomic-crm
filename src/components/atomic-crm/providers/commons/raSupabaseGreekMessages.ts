// Hand-written: no `ra-supabase-language-greek` package exists on npm, so this
// mirrors the shape of `ra-supabase-language-english`/`ra-supabase-language-french` directly.
export const raSupabaseGreekMessages = {
  "ra-supabase": {
    auth: {
      email: "Email",
      confirm_password: "Επιβεβαίωση κωδικού πρόσβασης",
      sign_in_with: "Σύνδεση με %{provider}",
      forgot_password: "Ξεχάσατε τον κωδικό πρόσβασης;",
      reset_password: "Επαναφορά κωδικού πρόσβασης",
      password_reset:
        "Ο κωδικός πρόσβασής σας επαναφέρθηκε. Θα λάβετε ένα email με σύνδεσμο για σύνδεση.",
      missing_tokens: "Λείπουν τα tokens πρόσβασης και ανανέωσης",
      back_to_login: "Πίσω στη σύνδεση",
    },
    reset_password: {
      forgot_password: "Ξεχάσατε τον κωδικό πρόσβασης;",
      forgot_password_details: "Εισαγάγετε το email σας για οδηγίες.",
    },
    set_password: {
      new_password: "Επιλέξτε τον κωδικό πρόσβασής σας",
    },
    validation: {
      password_mismatch: "Οι κωδικοί πρόσβασης δεν ταιριάζουν",
    },
  },
};
