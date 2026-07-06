import type { TranslationMessages } from "ra-core";

// Hand-written: no maintained `ra-language-greek` package targets this
// react-admin/ra-core version, so this mirrors the shape of
// `ra-language-english`/`ra-language-french` directly.
export const greekMessages: TranslationMessages = {
  ra: {
    action: {
      add_filter: "Προσθήκη φίλτρου",
      add: "Προσθήκη",
      back: "Πίσω",
      bulk_actions:
        "1 στοιχείο επιλέχθηκε |||| %{smart_count} στοιχεία επιλέχθηκαν",
      cancel: "Ακύρωση",
      clear_array_input: "Εκκαθάριση λίστας",
      clear_input_value: "Εκκαθάριση τιμής",
      clone: "Κλωνοποίηση",
      confirm: "Επιβεβαίωση",
      create: "Δημιουργία",
      create_item: "Δημιουργία %{item}",
      delete: "Διαγραφή",
      edit: "Επεξεργασία",
      export: "Εξαγωγή",
      list: "Λίστα",
      refresh: "Ανανέωση",
      remove_filter: "Αφαίρεση αυτού του φίλτρου",
      remove_all_filters: "Αφαίρεση όλων των φίλτρων",
      remove: "Αφαίρεση",
      reset: "Επαναφορά",
      save: "Αποθήκευση",
      search: "Αναζήτηση",
      search_columns: "Αναζήτηση στηλών",
      select_all: "Επιλογή όλων",
      select_all_button: "Επιλογή όλων",
      select_row: "Επιλογή αυτής της γραμμής",
      show: "Εμφάνιση",
      sort: "Ταξινόμηση",
      undo: "Αναίρεση",
      unselect: "Αποεπιλογή",
      expand: "Ανάπτυξη",
      close: "Κλείσιμο",
      open_menu: "Άνοιγμα μενού",
      close_menu: "Κλείσιμο μενού",
      update: "Ενημέρωση",
      move_up: "Μετακίνηση πάνω",
      move_down: "Μετακίνηση κάτω",
      open: "Άνοιγμα",
      toggle_theme: "Εναλλαγή φωτεινού/σκοτεινού θέματος",
      select_columns: "Στήλες",
      update_application: "Επαναφόρτωση εφαρμογής",
    },
    boolean: {
      true: "Ναι",
      false: "Όχι",
      null: " ",
    },
    page: {
      create: "Δημιουργία %{name}",
      dashboard: "Πίνακας ελέγχου",
      edit: "%{name} %{recordRepresentation}",
      error: "Κάτι πήγε στραβά",
      list: "%{name}",
      loading: "Φόρτωση",
      not_found: "Δεν βρέθηκε",
      show: "%{name} %{recordRepresentation}",
      empty: "Δεν υπάρχει ακόμα %{name}.",
      invite: "Θέλετε να προσθέσετε ένα;",
      access_denied: "Δεν επιτρέπεται η πρόσβαση",
      authentication_error: "Σφάλμα ταυτοποίησης",
    },
    input: {
      file: {
        upload_several:
          "Σύρετε αρχεία για μεταφόρτωση, ή κάντε κλικ για να επιλέξετε ένα.",
        upload_single:
          "Σύρετε ένα αρχείο για μεταφόρτωση, ή κάντε κλικ για να το επιλέξετε.",
      },
      image: {
        upload_several:
          "Σύρετε εικόνες για μεταφόρτωση, ή κάντε κλικ για να επιλέξετε μία.",
        upload_single:
          "Σύρετε μια εικόνα για μεταφόρτωση, ή κάντε κλικ για να την επιλέξετε.",
      },
      references: {
        all_missing: "Δεν είναι δυνατή η εύρεση δεδομένων αναφοράς.",
        many_missing:
          "Τουλάχιστον μία από τις σχετιζόμενες αναφορές δεν φαίνεται πλέον διαθέσιμη.",
        single_missing: "Η σχετιζόμενη αναφορά δεν φαίνεται πλέον διαθέσιμη.",
      },
      password: {
        toggle_visible: "Απόκρυψη κωδικού πρόσβασης",
        toggle_hidden: "Εμφάνιση κωδικού πρόσβασης",
      },
    },
    message: {
      about: "Σχετικά",
      access_denied:
        "Δεν έχετε τα απαραίτητα δικαιώματα για πρόσβαση σε αυτή τη σελίδα",
      are_you_sure: "Είστε σίγουροι;",
      authentication_error:
        "Ο διακομιστής ταυτοποίησης επέστρεψε σφάλμα και τα διαπιστευτήριά σας δεν μπόρεσαν να ελεγχθούν.",
      auth_error:
        "Παρουσιάστηκε σφάλμα κατά την επικύρωση του token ταυτοποίησης.",
      bulk_delete_content:
        "Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το %{name}; |||| Είστε σίγουροι ότι θέλετε να διαγράψετε αυτά τα %{smart_count} στοιχεία;",
      bulk_delete_title:
        "Διαγραφή %{name} |||| Διαγραφή %{smart_count} %{name}",
      bulk_update_content:
        "Είστε σίγουροι ότι θέλετε να ενημερώσετε το %{name} %{recordRepresentation}; |||| Είστε σίγουροι ότι θέλετε να ενημερώσετε αυτά τα %{smart_count} στοιχεία;",
      bulk_update_title:
        "Ενημέρωση %{name} %{recordRepresentation} |||| Ενημέρωση %{smart_count} %{name}",
      clear_array_input:
        "Είστε σίγουροι ότι θέλετε να εκκαθαρίσετε ολόκληρη τη λίστα;",
      delete_content:
        "Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το %{name};",
      delete_title: "Διαγραφή %{name} %{recordRepresentation}",
      details: "Λεπτομέρειες",
      error: "Παρουσιάστηκε σφάλμα πελάτη και το αίτημά σας δεν ολοκληρώθηκε.",
      invalid_form: "Η φόρμα δεν είναι έγκυρη. Ελέγξτε για σφάλματα",
      loading: "Παρακαλώ περιμένετε",
      no: "Όχι",
      not_found:
        "Είτε πληκτρολογήσατε λάθος διεύθυνση URL, είτε ακολουθήσατε λανθασμένο σύνδεσμο.",
      select_all_limit_reached:
        "Υπάρχουν πάρα πολλά στοιχεία για να τα επιλέξετε όλα. Επιλέχθηκαν μόνο τα πρώτα %{max} στοιχεία.",
      unsaved_changes:
        "Ορισμένες από τις αλλαγές σας δεν αποθηκεύτηκαν. Είστε σίγουροι ότι θέλετε να τις αγνοήσετε;",
      yes: "Ναι",
      placeholder_data_warning:
        "Πρόβλημα δικτύου: Η ανανέωση δεδομένων απέτυχε.",
    },
    navigation: {
      clear_filters: "Εκκαθάριση φίλτρων",
      no_filtered_results: "Δεν βρέθηκε %{name} με τα τρέχοντα φίλτρα.",
      no_results: "Δεν βρέθηκε %{name}",
      no_more_results:
        "Ο αριθμός σελίδας %{page} είναι εκτός ορίων. Δοκιμάστε την προηγούμενη σελίδα.",
      page_out_of_boundaries: "Ο αριθμός σελίδας %{page} είναι εκτός ορίων",
      page_out_from_end:
        "Δεν είναι δυνατή η μετάβαση μετά την τελευταία σελίδα",
      page_out_from_begin: "Δεν είναι δυνατή η μετάβαση πριν τη σελίδα 1",
      page_range_info: "%{offsetBegin}-%{offsetEnd} από %{total}",
      partial_page_range_info:
        "%{offsetBegin}-%{offsetEnd} από περισσότερα από %{offsetEnd}",
      current_page: "Σελίδα %{page}",
      page: "Μετάβαση στη σελίδα %{page}",
      first: "Μετάβαση στην πρώτη σελίδα",
      last: "Μετάβαση στην τελευταία σελίδα",
      next: "Μετάβαση στην επόμενη σελίδα",
      previous: "Μετάβαση στην προηγούμενη σελίδα",
      page_rows_per_page: "Γραμμές ανά σελίδα:",
      skip_nav: "Μετάβαση στο περιεχόμενο",
    },
    sort: {
      sort_by: "Ταξινόμηση κατά %{field_lower_first} %{order}",
      ASC: "αύξουσα",
      DESC: "φθίνουσα",
    },
    auth: {
      auth_check_error: "Παρακαλώ συνδεθείτε για να συνεχίσετε",
      user_menu: "Προφίλ",
      username: "Όνομα χρήστη",
      password: "Κωδικός πρόσβασης",
      email: "Email",
      sign_in: "Σύνδεση",
      sign_in_error: "Η ταυτοποίηση απέτυχε, παρακαλώ δοκιμάστε ξανά",
      logout: "Αποσύνδεση",
    },
    notification: {
      updated:
        "Το στοιχείο ενημερώθηκε |||| %{smart_count} στοιχεία ενημερώθηκαν",
      created: "Το στοιχείο δημιουργήθηκε",
      deleted:
        "Το στοιχείο διαγράφηκε |||| %{smart_count} στοιχεία διαγράφηκαν",
      bad_item: "Εσφαλμένο στοιχείο",
      item_doesnt_exist: "Το στοιχείο δεν υπάρχει",
      http_error: "Σφάλμα επικοινωνίας με τον διακομιστή",
      data_provider_error:
        "Σφάλμα dataProvider. Ελέγξτε την κονσόλα για λεπτομέρειες.",
      i18n_error:
        "Δεν είναι δυνατή η φόρτωση των μεταφράσεων για την καθορισμένη γλώσσα",
      canceled: "Η ενέργεια ακυρώθηκε",
      logged_out: "Η συνεδρία σας έληξε, παρακαλώ συνδεθείτε ξανά.",
      not_authorized: "Δεν έχετε εξουσιοδότηση για πρόσβαση σε αυτόν τον πόρο.",
      application_update_available: "Μια νέα έκδοση είναι διαθέσιμη.",
      offline: "Δεν υπάρχει συνδεσιμότητα. Δεν ήταν δυνατή η λήψη δεδομένων.",
    },
    validation: {
      required: "Υποχρεωτικό",
      minLength: "Πρέπει να έχει τουλάχιστον %{min} χαρακτήρες",
      maxLength: "Πρέπει να έχει έως %{max} χαρακτήρες",
      minValue: "Πρέπει να είναι τουλάχιστον %{min}",
      maxValue: "Πρέπει να είναι έως %{max}",
      number: "Πρέπει να είναι αριθμός",
      email: "Πρέπει να είναι έγκυρο email",
      oneOf: "Πρέπει να είναι ένα από: %{options}",
      regex: "Πρέπει να ταιριάζει με συγκεκριμένη μορφή (regexp): %{pattern}",
      unique: "Πρέπει να είναι μοναδικό",
    },
    saved_queries: {
      label: "Αποθηκευμένα ερωτήματα",
      query_name: "Όνομα ερωτήματος",
      new_label: "Αποθήκευση τρέχοντος ερωτήματος...",
      new_dialog_title: "Αποθήκευση τρέχοντος ερωτήματος ως",
      remove_label: "Αφαίρεση αποθηκευμένου ερωτήματος",
      remove_label_with_name: 'Αφαίρεση ερωτήματος "%{name}"',
      remove_dialog_title: "Αφαίρεση αποθηκευμένου ερωτήματος;",
      remove_message:
        "Είστε σίγουροι ότι θέλετε να αφαιρέσετε αυτό το στοιχείο από τη λίστα αποθηκευμένων ερωτημάτων σας;",
      help: "Φιλτράρετε τη λίστα και αποθηκεύστε αυτό το ερώτημα για αργότερα",
    },
    guesser: {
      empty: {
        title: "Δεν υπάρχουν δεδομένα προς εμφάνιση",
        message: "Παρακαλώ ελέγξτε τον πάροχο δεδομένων σας",
      },
    },
    configurable: {
      customize: "Προσαρμογή",
      configureMode: "Διαμόρφωση αυτής της σελίδας",
      inspector: {
        title: "Επιθεωρητής",
        content:
          "Περάστε το ποντίκι πάνω από τα στοιχεία της εφαρμογής για να τα διαμορφώσετε",
        reset: "Επαναφορά ρυθμίσεων",
        hideAll: "Απόκρυψη όλων",
        showAll: "Εμφάνιση όλων",
      },
      Datagrid: {
        title: "Πίνακας δεδομένων",
        unlabeled: "Στήλη χωρίς ετικέτα #%{column}",
      },
      SimpleForm: {
        title: "Φόρμα",
        unlabeled: "Πεδίο χωρίς ετικέτα #%{input}",
      },
      SimpleList: {
        title: "Λίστα",
        primaryText: "Κύριο κείμενο",
        secondaryText: "Δευτερεύον κείμενο",
        tertiaryText: "Τριτεύον κείμενο",
      },
    },
  },
};

export default greekMessages;
