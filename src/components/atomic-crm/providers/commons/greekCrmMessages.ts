import type { CrmMessages } from "./englishCrmMessages";

export const greekCrmMessages = {
  resources: {
    calendar: {
      name: "Ημερολόγιο",
    },
    properties: {
      name: "Ακίνητο |||| Ακίνητα",
    },
    companies: {
      name: "Εταιρεία |||| Εταιρείες",
      forcedCaseName: "Εταιρεία",
      fields: {
        name: "Όνομα εταιρείας",
        website: "Ιστότοπος",
        linkedin_url: "Διεύθυνση LinkedIn",
        phone_number: "Αριθμός τηλεφώνου",
        created_at: "Δημιουργήθηκε στις",
        nb_contacts: "Αριθμός επαφών",
        revenue: "Έσοδα",
        sector: "Τομέας",
        size: "Μέγεθος",
        tax_identifier: "ΑΦΜ",
        address: "Διεύθυνση",
        city: "Πόλη",
        zipcode: "Ταχυδρομικός κώδικας",
        state_abbr: "Πολιτεία",
        country: "Χώρα",
        description: "Περιγραφή",
        context_links: "Σύνδεσμοι πλαισίου",
        sales_id: "Υπεύθυνος λογαριασμού",
      },
      empty: {
        description: "Φαίνεται πως η λίστα εταιρειών σας είναι κενή.",
        title: "Δεν βρέθηκαν εταιρείες",
      },
      field_categories: {
        contact: "Επαφή",
        additional_info: "Επιπλέον πληροφορίες",
        address: "Διεύθυνση",
        context: "Πλαίσιο",
      },
      action: {
        create: "Δημιουργία εταιρείας",
        edit: "Επεξεργασία εταιρείας",
        new: "Νέα εταιρεία",
        show: "Εμφάνιση εταιρείας",
      },
      added_on: "Προστέθηκε στις %{date}",
      followed_by: "Παρακολουθείται από %{name}",
      followed_by_you: "Παρακολουθείται από εσάς",
      no_contacts: "Καμία επαφή",
      nb_contacts: "%{smart_count} επαφή |||| %{smart_count} επαφές",
      nb_deals: "%{smart_count} συμφωνία |||| %{smart_count} συμφωνίες",
      sizes: {
        one_employee: "1 εργαζόμενος",
        two_to_nine_employees: "2-9 εργαζόμενοι",
        ten_to_forty_nine_employees: "10-49 εργαζόμενοι",
        fifty_to_two_hundred_forty_nine_employees: "50-249 εργαζόμενοι",
        two_hundred_fifty_or_more_employees: "250 ή περισσότεροι εργαζόμενοι",
      },
      autocomplete: {
        create_error: "Παρουσιάστηκε σφάλμα κατά τη δημιουργία της εταιρείας",
        create_item: "Δημιουργία %{item}",
        create_label: "Πληκτρολογήστε για να δημιουργήσετε μια νέα εταιρεία",
      },
      filters: {
        only_mine: "Μόνο εταιρείες που διαχειρίζομαι",
      },
    },
    contacts: {
      name: "Επαφή |||| Επαφές",
      forcedCaseName: "Επαφή",
      field_categories: {
        background_info: "Πληροφορίες ιστορικού",
        identity: "Ταυτότητα",
        misc: "Διάφορα",
        personal_info: "Προσωπικές πληροφορίες",
        position: "Θέση",
      },
      fields: {
        first_name: "Όνομα",
        last_name: "Επώνυμο",
        last_seen: "Τελευταία εμφάνιση",
        title: "Τίτλος",
        company_id: "Εταιρεία",
        email_jsonb: "Διευθύνσεις email",
        email: "Email",
        phone_jsonb: "Αριθμοί τηλεφώνου",
        phone_number: "Αριθμός τηλεφώνου",
        linkedin_url: "Διεύθυνση LinkedIn",
        background:
          "Πληροφορίες ιστορικού (βιογραφικό, πώς γνωριστήκατε, κ.λπ.)",
        has_newsletter: "Έχει ενημερωτικό δελτίο",
        sales_id: "Υπεύθυνος λογαριασμού",
      },
      action: {
        add: "Προσθήκη επαφής",
        add_first: "Προσθέστε την πρώτη σας επαφή",
        create: "Δημιουργία επαφής",
        edit: "Επεξεργασία επαφής",
        export_vcard: "Εξαγωγή σε vCard",
        new: "Νέα επαφή",
        show: "Εμφάνιση επαφής",
      },
      background: {
        last_activity_on: "Τελευταία δραστηριότητα στις %{date}",
        added_on: "Προστέθηκε στις %{date}",
        followed_by: "Παρακολουθείται από %{name}",
        followed_by_you: "Παρακολουθείται από εσάς",
        status_none: "Καμία",
      },
      position_at: "%{title} στην",
      position_at_company: "%{title} στην %{company}",
      empty: {
        description: "Φαίνεται πως η λίστα επαφών σας είναι κενή.",
        title: "Δεν βρέθηκαν επαφές",
      },
      import: {
        title: "Εισαγωγή επαφών",
        button: "Εισαγωγή CSV",
        complete:
          "Η εισαγωγή επαφών ολοκληρώθηκε. Εισήχθησαν %{importCount} επαφές, με %{errorCount} σφάλματα",
        progress:
          "Εισήχθησαν %{importCount} / %{rowCount} επαφές, με %{errorCount} σφάλματα.",
        error:
          "Η εισαγωγή του αρχείου απέτυχε, βεβαιωθείτε ότι δώσατε ένα έγκυρο αρχείο CSV.",
        imported: "Εισήχθη",
        remaining_time: "Εκτιμώμενος υπολειπόμενος χρόνος:",
        running:
          "Η εισαγωγή βρίσκεται σε εξέλιξη, παρακαλώ μην κλείσετε αυτή την καρτέλα.",
        sample_download: "Λήψη δείγματος CSV",
        sample_hint:
          "Ορίστε ένα δείγμα αρχείου CSV που μπορείτε να χρησιμοποιήσετε ως πρότυπο",
        stop: "Διακοπή εισαγωγής",
        csv_file: "Αρχείο CSV",
        contacts_label: "επαφή |||| επαφές",
      },
      inputs: {
        genders: {
          male: "Αυτός",
          female: "Αυτή",
          nonbinary: "Αυτά",
        },
        personal_info_types: {
          work: "Εργασία",
          home: "Οικία",
          other: "Άλλο",
        },
      },
      list: {
        error_loading: "Σφάλμα φόρτωσης επαφών",
      },
      bulk_tag: {
        action: "Ετικέτα",
        back: "Πίσω στις ετικέτες",
        create_description:
          "Δημιουργήστε μια νέα ετικέτα και εφαρμόστε την στις επιλεγμένες επαφές.",
        description:
          "Επιλέξτε μια υπάρχουσα ετικέτα ή δημιουργήστε μια νέα για τις επιλεγμένες επαφές.",
        empty:
          "Δεν υπάρχουν ακόμα ετικέτες. Δημιουργήστε μία για να επισημάνετε τις επιλεγμένες επαφές.",
        error: "Η προσθήκη ετικέτας στις επαφές απέτυχε",
        noop: "Οι επιλεγμένες επαφές έχουν ήδη αυτή την ετικέτα",
        success:
          "Η ετικέτα προστέθηκε σε %{smart_count} επαφή |||| Η ετικέτα προστέθηκε σε %{smart_count} επαφές",
        title: "Προσθήκη ετικέτας σε επαφές",
      },
      merge: {
        action: "Συγχώνευση με άλλη επαφή",
        confirm: "Συγχώνευση επαφών",
        current_contact: "Τρέχουσα επαφή (θα διαγραφεί)",
        description: "Συγχωνεύστε αυτή την επαφή με μια άλλη.",
        error: "Η συγχώνευση επαφών απέτυχε",
        merging: "Συγχώνευση...",
        no_additional_data: "Δεν υπάρχουν επιπλέον δεδομένα για συγχώνευση",
        select_target: "Παρακαλώ επιλέξτε μια επαφή για συγχώνευση",
        success: "Οι επαφές συγχωνεύτηκαν επιτυχώς",
        target_contact: "Επαφή προορισμού (θα διατηρηθεί)",
        title: "Συγχώνευση επαφής",
        warning_description:
          "Όλα τα δεδομένα θα μεταφερθούν στη δεύτερη επαφή. Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.",
        warning_title: "Προειδοποίηση: Καταστροφική ενέργεια",
        what_will_be_merged: "Τι θα συγχωνευτεί:",
      },
      filters: {
        before_last_month: "Πριν τον προηγούμενο μήνα",
        before_this_month: "Πριν αυτόν τον μήνα",
        before_this_week: "Πριν αυτή την εβδομάδα",
        managed_by_me: "Διαχειρίζομαι εγώ",
        search: "Αναζήτηση ονόματος, εταιρείας...",
        this_week: "Αυτή την εβδομάδα",
        today: "Σήμερα",
        tags: "Ετικέτες",
        tasks: "Εργασίες",
      },
      hot: {
        empty_change_status:
          'Αλλάξτε την κατάσταση μιας επαφής προσθέτοντας μια σημείωση σε αυτή την επαφή και κάνοντας κλικ στο "εμφάνιση επιλογών".',
        empty_hint: 'Οι επαφές με κατάσταση "hot" θα εμφανίζονται εδώ.',
        title: "Ενεργές επαφές",
      },
    },
    deals: {
      name: "Συμφωνία |||| Συμφωνίες",
      fields: {
        name: "Όνομα",
        description: "Περιγραφή",
        company_id: "Εταιρεία",
        contact_ids: "Επαφές",
        category: "Κατηγορία",
        amount: "Προϋπολογισμός",
        expected_closing_date: "Αναμενόμενη ημερομηνία κλεισίματος",
        stage: "Στάδιο",
      },
      action: {
        back_to_deal: "Πίσω στη συμφωνία",
        create: "Δημιουργία συμφωνίας",
        new: "Νέα συμφωνία",
      },
      field_categories: {
        misc: "Διάφορα",
      },
      archived: {
        action: "Αρχειοθέτηση",
        error: "Σφάλμα: η συμφωνία δεν αρχειοθετήθηκε",
        list_title: "Αρχειοθετημένες συμφωνίες",
        success: "Η συμφωνία αρχειοθετήθηκε",
        title: "Αρχειοθετημένη συμφωνία",
        view: "Προβολή αρχειοθετημένων συμφωνιών",
      },
      inputs: {
        linked_to: "Συνδέεται με",
      },
      unarchived: {
        action: "Επιστροφή στον πίνακα",
        error: "Σφάλμα: η συμφωνία δεν αποαρχειοθετήθηκε",
        success: "Η συμφωνία αποαρχειοθετήθηκε",
      },
      updated: "Η συμφωνία ενημερώθηκε",
      empty: {
        before_create: "πριν δημιουργήσετε μια συμφωνία.",
        description: "Φαίνεται πως η λίστα συμφωνιών σας είναι κενή.",
        title: "Δεν βρέθηκαν συμφωνίες",
      },
      invalid_date: "Μη έγκυρη ημερομηνία",
    },
    notes: {
      name: "Σημείωση |||| Σημειώσεις",
      forcedCaseName: "Σημείωση",
      fields: {
        status: "Κατάσταση",
        date: "Ημερομηνία",
        attachments: "Συνημμένα",
        contact_id: "Επαφή",
        deal_id: "Συμφωνία",
      },
      action: {
        add: "Προσθήκη σημείωσης",
        add_first: "Προσθέστε την πρώτη σας σημείωση",
        delete: "Διαγραφή σημείωσης",
        edit: "Επεξεργασία σημείωσης",
        update: "Ενημέρωση σημείωσης",
        add_this: "Προσθήκη αυτής της σημείωσης",
      },
      sheet: {
        create: "Δημιουργία σημείωσης",
        create_for: "Δημιουργία σημείωσης για %{name}",
        edit: "Επεξεργασία σημείωσης",
        edit_for: "Επεξεργασία σημείωσης για %{name}",
      },
      deleted: "Η σημείωση διαγράφηκε",
      empty: "Δεν υπάρχουν ακόμα σημειώσεις",
      author_added: "%{name} πρόσθεσε μια σημείωση",
      you_added: "Προσθέσατε μια σημείωση",
      me: "Εγώ",
      list: {
        error_loading: "Σφάλμα φόρτωσης σημειώσεων",
      },
      note_for_contact: "Σημείωση για %{name}",
      stepper: {
        hint: "Μεταβείτε σε μια σελίδα επαφής και προσθέστε μια σημείωση",
      },
      added: "Η σημείωση προστέθηκε",
      inputs: {
        add_note: "Προσθήκη σημείωσης",
        options_hint: "(επισυνάψτε αρχεία, ή αλλάξτε λεπτομέρειες)",
        show_options: "Εμφάνιση επιλογών",
      },
      actions: {
        attach_document: "Επισύναψη εγγράφου",
      },
      validation: {
        note_or_attachment_required: "Απαιτείται σημείωση ή συνημμένο",
      },
    },
    sales: {
      name: "Χρήστης |||| Χρήστες",
      fields: {
        first_name: "Όνομα",
        last_name: "Επώνυμο",
        email: "Email",
        administrator: "Διαχειριστής",
        disabled: "Απενεργοποιημένος",
      },
      create: {
        error: "Παρουσιάστηκε σφάλμα κατά τη δημιουργία του χρήστη.",
        success:
          "Ο χρήστης δημιουργήθηκε. Θα λάβει σύντομα ένα email για να ορίσει τον κωδικό πρόσβασής του.",
        title: "Δημιουργία νέου χρήστη",
      },
      edit: {
        error: "Παρουσιάστηκε σφάλμα. Παρακαλώ δοκιμάστε ξανά.",
        record_not_found: "Η εγγραφή δεν βρέθηκε",
        success: "Ο χρήστης ενημερώθηκε επιτυχώς",
        title: "Επεξεργασία %{name}",
      },
      action: {
        new: "Νέος χρήστης",
      },
    },
    tasks: {
      name: "Εργασία |||| Εργασίες",
      forcedCaseName: "Εργασία",
      fields: {
        text: "Περιγραφή",
        due_date: "Ημερομηνία λήξης",
        type: "Τύπος",
        contact_id: "Επαφή",
        due_short: "λήξη",
      },
      action: {
        add: "Προσθήκη εργασίας",
        create: "Δημιουργία εργασίας",
        edit: "Επεξεργασία εργασίας",
      },
      actions: {
        postpone_next_week: "Αναβολή για την επόμενη εβδομάδα",
        postpone_tomorrow: "Αναβολή για αύριο",
        title: "ενέργειες εργασίας",
      },
      added: "Η εργασία προστέθηκε",
      deleted: "Η εργασία διαγράφηκε επιτυχώς",
      dialog: {
        create: "Δημιουργία εργασίας",
        create_for: "Δημιουργία εργασίας για %{name}",
      },
      sheet: {
        edit: "Επεξεργασία εργασίας",
        edit_for: "Επεξεργασία εργασίας για %{name}",
      },
      empty: "Δεν υπάρχουν ακόμα εργασίες",
      empty_list_hint:
        "Οι εργασίες που προστίθενται στις επαφές σας θα εμφανίζονται εδώ.",
      filters: {
        later: "Αργότερα",
        overdue: "Εκπρόθεσμες",
        this_week: "Αυτή την εβδομάδα",
        today: "Σήμερα",
        tomorrow: "Αύριο",
        with_pending: "Με εκκρεμείς εργασίες",
      },
      regarding_contact: "(Σχετ: %{name})",
      updated: "Η εργασία ενημερώθηκε",
    },
    tags: {
      name: "Ετικέτα |||| Ετικέτες",
      action: {
        add: "Προσθήκη ετικέτας",
        create: "Δημιουργία νέας ετικέτας",
      },
      dialog: {
        color: "Χρώμα",
        create_title: "Δημιουργία νέας ετικέτας",
        edit_title: "Επεξεργασία ετικέτας",
        name_label: "Όνομα ετικέτας",
        name_placeholder: "Εισαγάγετε όνομα ετικέτας",
      },
    },
  },
  crm: {
    action: {
      reset_password: "Επαναφορά κωδικού πρόσβασης",
    },
    auth: {
      first_name: "Όνομα",
      last_name: "Επώνυμο",
      confirm_password: "Επιβεβαίωση κωδικού πρόσβασης",
      confirmation_required:
        "Παρακαλώ ακολουθήστε τον σύνδεσμο που μόλις σας στείλαμε με email για να επιβεβαιώσετε τον λογαριασμό σας.",
      recovery_email_sent:
        "Αν είστε εγγεγραμμένος χρήστης, θα λάβετε σύντομα ένα email ανάκτησης κωδικού πρόσβασης.",
      sign_in_failed: "Η σύνδεση απέτυχε.",
      sign_in_google_workspace: "Σύνδεση με Google Workspace",
      signup: {
        create_account: "Δημιουργία λογαριασμού",
        create_first_user:
          "Δημιουργήστε τον πρώτο λογαριασμό χρήστη για να ολοκληρώσετε τη ρύθμιση.",
        creating: "Δημιουργία...",
        initial_user_created: "Ο αρχικός χρήστης δημιουργήθηκε επιτυχώς",
      },
      welcome_title: "Καλώς ήρθατε στο Atomic CRM",
    },
    common: {
      activity: "Δραστηριότητα",
      added: "προστέθηκε",
      details: "Λεπτομέρειες",
      last_activity_with_date: "τελευταία δραστηριότητα %{date}",
      load_more: "Φόρτωση περισσότερων",
      misc: "Διάφορα",
      past: "Παρελθόν",
      read_more: "Διαβάστε περισσότερα",
      retry: "Επανάληψη",
      show_less: "Εμφάνιση λιγότερων",
      copied: "Αντιγράφηκε!",
      copy: "Αντιγραφή",
      loading: "Φόρτωση...",
      me: "Εγώ",
      task_count: "%{smart_count} εργασία |||| %{smart_count} εργασίες",
    },
    changelog: {
      title: "Ιστορικό αλλαγών",
    },
    activity: {
      added_company: "%{name} πρόσθεσε εταιρεία",
      you_added_company: "Προσθέσατε εταιρεία",
      added_contact: "%{name} πρόσθεσε",
      you_added_contact: "Προσθέσατε",
      added_note: "%{name} πρόσθεσε μια σημείωση σχετικά με",
      you_added_note: "Προσθέσατε μια σημείωση σχετικά με",
      added_note_about_deal:
        "%{name} πρόσθεσε μια σημείωση σχετικά με τη συμφωνία",
      you_added_note_about_deal:
        "Προσθέσατε μια σημείωση σχετικά με τη συμφωνία",
      added_deal: "%{name} πρόσθεσε συμφωνία",
      you_added_deal: "Προσθέσατε συμφωνία",
      at_company: "στην",
      to: "σε",
      load_more: "Φόρτωση περισσότερης δραστηριότητας",
    },
    dashboard: {
      deals_chart: "Επερχόμενα έσοδα συμφωνιών",
      deals_pipeline: "Ροή συμφωνιών",
      latest_activity: "Πρόσφατη δραστηριότητα",
      latest_activity_error: "Σφάλμα φόρτωσης πρόσφατης δραστηριότητας",
      latest_notes: "Οι τελευταίες μου σημειώσεις",
      latest_notes_added_ago: "προστέθηκε %{timeAgo}",
      stepper: {
        install: "Εγκατάσταση Atomic CRM",
        progress: "%{step}/3 ολοκληρώθηκαν",
        whats_next: "Τι ακολουθεί;",
      },
      upcoming_tasks: "Επερχόμενες εργασίες",
    },
    header: {
      import_data: "Εισαγωγή δεδομένων",
    },
    image_editor: {
      change: "Αλλαγή",
      drop_hint:
        "Σύρετε ένα αρχείο για μεταφόρτωση, ή κάντε κλικ για να το επιλέξετε.",
      editable_content: "Επεξεργάσιμο περιεχόμενο",
      title: "Μεταφόρτωση και αλλαγή μεγέθους εικόνας",
      update_image: "Ενημέρωση εικόνας",
    },
    import: {
      action: {
        download_error_report: "Λήψη αναφοράς σφαλμάτων",
        import: "Εισαγωγή",
        import_another: "Εισαγωγή άλλου αρχείου",
      },
      error: {
        unable: "Δεν είναι δυνατή η εισαγωγή αυτού του αρχείου.",
      },
      idle: {
        description_1:
          "Μπορείτε να εισάγετε πωλητές, εταιρείες, επαφές, σημειώσεις και εργασίες.",
        description_2:
          "Τα δεδομένα πρέπει να είναι σε αρχείο JSON που ταιριάζει με το ακόλουθο δείγμα:",
      },
      status: {
        all_success: "Όλες οι εγγραφές εισήχθησαν επιτυχώς.",
        complete: "Η εισαγωγή ολοκληρώθηκε.",
        failed: "Απέτυχε",
        imported: "Εισήχθη",
        in_progress:
          "Η εισαγωγή βρίσκεται σε εξέλιξη, παρακαλώ μην απομακρυνθείτε από αυτή τη σελίδα.",
        some_failed: "Ορισμένες εγγραφές δεν εισήχθησαν.",
        table_caption: "Κατάσταση εισαγωγής",
      },
      title: "Εισαγωγή δεδομένων",
    },
    settings: {
      about: "Σχετικά",
      companies: {
        sectors: "Τομείς",
      },
      dark_mode_logo: "Λογότυπο σκοτεινού θέματος",
      deals: {
        categories: "Κατηγορίες",
        currency: "Νόμισμα",
        pipeline_help:
          "Επιλέξτε ποια στάδια συμφωνιών θα υπολογίζονται ως συμφωνίες ροής.",
        pipeline_statuses: "Καταστάσεις ροής",
        stages: "Στάδια",
      },
      light_mode_logo: "Λογότυπο φωτεινού θέματος",
      notes: {
        statuses: "Καταστάσεις",
      },
      reset_defaults: "Επαναφορά προεπιλογών",
      save_error: "Η αποθήκευση της διαμόρφωσης απέτυχε",
      saved: "Η διαμόρφωση αποθηκεύτηκε επιτυχώς",
      saving: "Αποθήκευση...",
      tasks: {
        types: "Τύποι",
      },
      preferences: "Προτιμήσεις",
      title: "Ρυθμίσεις",
      app_title: "Τίτλος εφαρμογής",
      sections: {
        branding: "Ταυτότητα",
      },
      validation: {
        duplicate: "Διπλότυπο %{display_name}: %{items}",
        in_use:
          "Δεν είναι δυνατή η αφαίρεση %{display_name} που χρησιμοποιούνται ακόμα από συμφωνίες: %{items}",
        validating: "Επικύρωση…",
        entities: {
          categories: "κατηγορίες",
          stages: "στάδια",
        },
      },
    },
    theme: {
      dark: "Σκοτεινό",
      label: "Θέμα",
      light: "Φωτεινό",
      system: "Σύστημα",
    },
    language: "Γλώσσα",
    navigation: {
      label: "Πλοήγηση CRM",
    },
    profile: {
      inbound: {
        description:
          "Μπορείτε να αρχίσετε να στέλνετε email στη διεύθυνση εισερχόμενων email του διακομιστή σας, π.χ. προσθέτοντάς την στο πεδίο %{field}. Το Atomic CRM θα επεξεργαστεί τα email και θα προσθέσει σημειώσεις στις αντίστοιχες επαφές.",
        title: "Εισερχόμενο email",
      },
      mcp: {
        title: "Διακομιστής MCP",
        description:
          "Χρησιμοποιήστε αυτή τη διεύθυνση URL για να συνδέσετε τον βοηθό AI σας με τα δεδομένα του CRM μέσω του Model Context Protocol (MCP).",
      },
      password: {
        change: "Αλλαγή κωδικού πρόσβασης",
      },
      password_reset_sent:
        "Ένα email επαναφοράς κωδικού πρόσβασης έχει σταλεί στη διεύθυνση email σας",
      record_not_found: "Η εγγραφή δεν βρέθηκε",
      title: "Προφίλ",
      updated: "Το προφίλ σας ενημερώθηκε",
      update_error: "Παρουσιάστηκε σφάλμα. Παρακαλώ δοκιμάστε ξανά",
    },
    validation: {
      invalid_url: "Πρέπει να είναι έγκυρη διεύθυνση URL",
      invalid_linkedin_url:
        "Η διεύθυνση URL πρέπει να προέρχεται από το linkedin.com",
    },
  },
} satisfies CrmMessages;
