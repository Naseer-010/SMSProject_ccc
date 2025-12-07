#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define STUDENT_FILE "students.txt"
#define CREDENTIAL_FILE "credentials.txt"
#define TMP_FILE "tmp.txt"

typedef struct {
    int roll;
    char name[50];
    float marks;
} Student;

char currentRole[10];
char currentUser[50];

/* Function prototypes */
int loginSystem(void);
void mainMenu(void);
void adminMenu(void);
void userMenu(void);
void staffMenu(void);
void guestMenu(void);

void addStudent(void);
void displayStudents(void);
void searchStudent(void);
void updateStudent(void);
void deleteStudent(void);

void flushInput(void);

/* New helper prototypes */
int parse_student_line(const char *line, Student *s);
void write_student_to_file(FILE *fp, const Student *s);

int main(void) {
    if (loginSystem()) {
        mainMenu();
    } else {
        printf("\nAccess Denied. Exiting...\n");
    }
    return 0;
}

/* Simple input flush to remove leftover newline */
void flushInput(void) {
    int c;
    while ((c = getchar()) != '\n' && c != EOF) {}
}

/* Login reads credentials from CREDENTIAL_FILE */
int loginSystem(void) {
    char username[50], password[50];
    char fileUser[50], filePass[50], fileRole[10];

    printf("===== Login =====\n");
    printf("Username: ");
    if (scanf("%49s", username) != 1) return 0;
    printf("Password: ");
    if (scanf("%49s", password) != 1) return 0;
    flushInput();

    FILE *fp = fopen(CREDENTIAL_FILE, "r");
    if (!fp) {
        printf("Error: %s not found!\n", CREDENTIAL_FILE);
        return 0;
    }

    while (fscanf(fp, "%49s %49s %9s", fileUser, filePass, fileRole) == 3) {
        if (strcmp(username, fileUser) == 0 && strcmp(password, filePass) == 0) {
            strncpy(currentRole, fileRole, sizeof(currentRole)-1);
            currentRole[sizeof(currentRole)-1] = '\0';
            strncpy(currentUser, fileUser, sizeof(currentUser)-1);
            currentUser[sizeof(currentUser)-1] = '\0';
            fclose(fp);
            printf("Login successful. Role: %s\n", currentRole);
            return 1;
        }
    }

    fclose(fp);
    return 0;
}

/* Dispatch to role-specific menus */
void mainMenu(void) {
    if (strcmp(currentRole, "ADMIN") == 0) adminMenu();
    else if (strcmp(currentRole, "USER") == 0) userMenu();
    else if (strcmp(currentRole, "STAFF") == 0) staffMenu();
    else guestMenu();
}

/* ADMIN menu with full CRUD */
void adminMenu(void) {
    int choice;
    do {
        printf("\n===== ADMIN MENU =====\n");
        printf("1. Add Student\n");
        printf("2. Display Students\n");
        printf("3. Search Student\n");
        printf("4. Update Student\n");
        printf("5. Delete Student\n");
        printf("6. Logout\n");
        printf("Enter choice: ");
        if (scanf("%d", &choice) != 1) { flushInput(); choice = -1; }
        switch (choice) {
            case 1: addStudent(); break;
            case 2: displayStudents(); break;
            case 3: searchStudent(); break;
            case 4: updateStudent(); break;
            case 5: deleteStudent(); break;
            case 6: printf("Logging out...\n"); return;
            default: printf("Invalid choice!\n");
        }
    } while (1);
}

/* USER menu — limited operations: display and search */
void userMenu(void) {
    int choice;
    do {
        printf("\n===== USER MENU =====\n");
        printf("1. Display Students\n");
        printf("2. Search Student\n");
        printf("3. Logout\n");
        printf("Enter choice: ");
        if (scanf("%d", &choice) != 1) { flushInput(); choice = -1; }
        switch (choice) {
            case 1: displayStudents(); break;
            case 2: searchStudent(); break;
            case 3: printf("Logging out...\n"); return;
            default: printf("Invalid choice!\n");
        }
    } while (1);
}

/* STAFF menu — allow add, display, search but not delete/update */
void staffMenu(void) {
    int choice;
    do {
        printf("\n===== STAFF MENU =====\n");
        printf("1. Add Student\n");
        printf("2. Display Students\n");
        printf("3. Search Student\n");
        printf("4. Logout\n");
        printf("Enter choice: ");
        if (scanf("%d", &choice) != 1) { flushInput(); choice = -1; }
        switch (choice) {
            case 1: addStudent(); break;
            case 2: displayStudents(); break;
            case 3: searchStudent(); break;
            case 4: printf("Logging out...\n"); return;
            default: printf("Invalid choice!\n");
        }
    } while (1);
}

/* GUEST menu — only display */
void guestMenu(void) {
    int choice;
    do {
        printf("\n===== GUEST MENU =====\n");
        printf("1. Display Students\n");
        printf("2. Logout\n");
        printf("Enter choice: ");
        if (scanf("%d", &choice) != 1) { flushInput(); choice = -1; }
        switch (choice) {
            case 1: displayStudents(); break;
            case 2: printf("Logging out...\n"); return;
            default: printf("Invalid choice!\n");
        }
    } while (1);
}

/* Helper: parse a student line into Student s.
   Accepts both space and tab separators.
   Format assumed: roll <sep> name (may have spaces) <sep> marks
   Returns 1 on success, 0 on failure. */
int parse_student_line(const char *line, Student *s) {
    char buf[256];
    strncpy(buf, line, sizeof(buf)-1);
    buf[sizeof(buf)-1] = '\0';

    // Tokenize by whitespace (space or tab)
    char *tokens[64];
    int tcount = 0;
    char *p = strtok(buf, " \t\r\n");
    while (p && tcount < 64) {
        tokens[tcount++] = p;
        p = strtok(NULL, " \t\r\n");
    }
    if (tcount < 3) return 0; // need at least roll, name, marks

    // first token -> roll
    s->roll = atoi(tokens[0]);

    // last token -> marks
    s->marks = (float)atof(tokens[tcount-1]);

    // middle tokens (1..tcount-2) -> name (join with spaces)
    s->name[0] = '\0';
    for (int i = 1; i <= tcount-2; ++i) {
        if (i > 1) strncat(s->name, " ", sizeof(s->name)-strlen(s->name)-1);
        strncat(s->name, tokens[i], sizeof(s->name)-strlen(s->name)-1);
    }
    return 1;
}

/* Helper: write a student record to file (tab-separated) */
void write_student_to_file(FILE *fp, const Student *s) {
    fprintf(fp, "%d\t%s\t%.2f\n", s->roll, s->name, s->marks);
}

/* Add a student (appends to file). Prevent duplicate roll numbers. */
void addStudent(void) {
    Student s;
    FILE *fp;
    int rollExists = 0;

    printf("\nEnter roll number: ");
    if (scanf("%d", &s.roll) != 1) { printf("Invalid input.\n"); flushInput(); return; }
    flushInput();

    /* Check duplicate roll using fgets+parser so we accept any existing format */
    fp = fopen(STUDENT_FILE, "r");
    if (fp) {
        char line[256];
        Student tmp;
        while (fgets(line, sizeof(line), fp)) {
            if (parse_student_line(line, &tmp)) {
                if (tmp.roll == s.roll) { rollExists = 1; break; }
            }
        }
        fclose(fp);
    }
    if (rollExists) {
        printf("A student with roll %d already exists. Aborting add.\n", s.roll);
        return;
    }

    printf("Enter name: ");
    /* read a full line including spaces */
    if (fgets(s.name, sizeof(s.name), stdin) == NULL) { printf("Error reading name.\n"); return; }
    /* remove newline */
    s.name[strcspn(s.name, "\n")] = '\0';

    printf("Enter marks: ");
    if (scanf("%f", &s.marks) != 1) { printf("Invalid marks.\n"); flushInput(); return; }
    flushInput();

    fp = fopen(STUDENT_FILE, "a");
    if (!fp) {
        printf("Error opening %s for writing.\n", STUDENT_FILE);
        return;
    }
    /* write: tab-separated fields so reading is unambiguous */
    write_student_to_file(fp, &s);
    fclose(fp);
    printf("Student added successfully.\n");
}

/* Display all students in a friendly table */
void displayStudents(void) {
    FILE *fp = fopen(STUDENT_FILE, "r");
    if (!fp) {
        printf("No students found (file %s not present).\n", STUDENT_FILE);
        return;
    }
    char line[256];
    Student s;
    int found = 0;
    printf("\n%-8s %-25s %-6s\n", "Roll", "Name", "Marks");
    printf("-----------------------------------------------\n");
    while (fgets(line, sizeof(line), fp)) {
        if (parse_student_line(line, &s)) {
            printf("%-8d %-25s %-6.2f\n", s.roll, s.name, s.marks);
            found = 1;
        }
    }
    if (!found) printf("No students to display.\n");
    fclose(fp);
}

/* Search by roll number */
void searchStudent(void) {
    int roll;
    printf("\nEnter roll to search: ");
    if (scanf("%d", &roll) != 1) { printf("Invalid input.\n"); flushInput(); return; }
    flushInput();

    FILE *fp = fopen(STUDENT_FILE, "r");
    if (!fp) {
        printf("No students found (file %s not present).\n", STUDENT_FILE);
        return;
    }
    char line[256];
    Student s;
    int found = 0;
    while (fgets(line, sizeof(line), fp)) {
        if (parse_student_line(line, &s)) {
            if (s.roll == roll) {
                printf("\nStudent found:\nRoll : %d\nName : %s\nMarks: %.2f\n", s.roll, s.name, s.marks);
                found = 1;
                break;
            }
        }
    }
    if (!found) printf("Student with roll %d not found.\n", roll);
    fclose(fp);
}

/* Update a student identified by roll. Rewrites file to a temp file. */
void updateStudent(void) {
    int roll;
    printf("\nEnter roll to update: ");
    if (scanf("%d", &roll) != 1) { printf("Invalid input.\n"); flushInput(); return; }
    flushInput();

    FILE *fp = fopen(STUDENT_FILE, "r");
    if (!fp) {
        printf("No students found (file %s not present).\n", STUDENT_FILE);
        return;
    }
    FILE *tmp = fopen(TMP_FILE, "w");
    if (!tmp) { fclose(fp); printf("Could not open temporary file.\n"); return; }

    char line[256];
    Student s;
    int found = 0;
    while (fgets(line, sizeof(line), fp)) {
        if (!parse_student_line(line, &s)) {
            // if line can't be parsed, write it back unchanged to preserve file
            fputs(line, tmp);
            continue;
        }
        if (s.roll == roll) {
            found = 1;
            printf("Current name: %s\nEnter new name (leave blank to keep): ", s.name);
            char newname[50];
            if (fgets(newname, sizeof(newname), stdin) == NULL) newname[0] = '\0';
            newname[strcspn(newname, "\n")] = '\0';
            if (strlen(newname) > 0) strncpy(s.name, newname, sizeof(s.name)-1);

            printf("Current marks: %.2f\nEnter new marks (negative to keep): ", s.marks);
            float newmarks;
            if (scanf("%f", &newmarks) != 1) newmarks = -1;
            flushInput();
            if (newmarks >= 0) s.marks = newmarks;

            printf("Updating student %d.\n", s.roll);
        }
        write_student_to_file(tmp, &s);
    }

    fclose(fp);
    fclose(tmp);

    if (!found) {
        printf("Student with roll %d not found. No changes made.\n", roll);
        remove(TMP_FILE);
    } else {
        /* replace original file */
        remove(STUDENT_FILE);
        rename(TMP_FILE, STUDENT_FILE);
        printf("Student updated successfully.\n");
    }
}

/* Delete student by roll. Rewrites file skipping the matched roll. */
void deleteStudent(void) {
    int roll;
    printf("\nEnter roll to delete: ");
    if (scanf("%d", &roll) != 1) { printf("Invalid input.\n"); flushInput(); return; }
    flushInput();

    FILE *fp = fopen(STUDENT_FILE, "r");
    if (!fp) {
        printf("No students found (file %s not present).\n", STUDENT_FILE);
        return;
    }
    FILE *tmp = fopen(TMP_FILE, "w");
    if (!tmp) { fclose(fp); printf("Could not open temporary file.\n"); return; }

    char line[256];
    Student s;
    int found = 0;
    while (fgets(line, sizeof(line), fp)) {
        if (!parse_student_line(line, &s)) {
            // write unparseable line back to preserve data
            fputs(line, tmp);
            continue;
        }
        if (s.roll == roll) {
            found = 1;
            /* skip writing to delete */
            continue;
        } else {
            write_student_to_file(tmp, &s);
        }
    }

    fclose(fp);
    fclose(tmp);

    if (!found) {
        printf("Student with roll %d not found. No deletion done.\n", roll);
        remove(TMP_FILE);
    } else {
        remove(STUDENT_FILE);
        rename(TMP_FILE, STUDENT_FILE);
        printf("Student with roll %d deleted successfully.\n", roll);
    }
}