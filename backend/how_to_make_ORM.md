Here is the complete, updated content for [backend/how_to_make_ORM.md](file:///home/rsrour/data/42/ft_transcendence/backend/how_to_make_ORM.md). You can replace the entire file with this:

```markdown
# 📖 SOP: Adding a New Database Table (Model) in Django

This guide outlines the standard procedure for adding a new database table to the RemoLab backend. Because we use Django's Object-Relational Mapper (ORM), **we write Python classes, not raw SQL**. Django will automatically generate the SQL migrations for PostgreSQL.

> ⚠️ **Crucial Rule:** All `manage.py` commands must be run **inside the Docker container** (via `docker exec`) to ensure they use the correct environment, secrets, and database connection. Commands must be run from your host machine's `backend/` directory.

---

## Step 1: Determine the App
Does this new table belong to an existing domain (e.g., `organizations`, `billing`, `users`)? 
* **Yes:** Skip to **Step 2** and use that existing app.
* **No:** Create a new app. Run this from your host machine's `backend/` directory:
  ```bash
  docker exec -it remolab_web python manage.py startapp <app_name>
  ```
  *(Example: `docker exec -it remolab_web python manage.py startapp billing`)*

---

## Step 2: Define the Model
Open the `models.py` file inside your chosen app directory (e.g., `remolab/<app_name>/models.py`) and define your table as a Python class inheriting from `models.Model`.

**Example: Adding a `TableName` model**
```python
from django.db import models

# 1. Define Enums using TextChoices (Industry Standard for Django)
class Column3Type(models.TextChoices):
    OPTION_A = 'A', 'Option A Description'
    OPTION_B = 'B', 'Option B Description'

# 2. Define the Table Model
class TableName(models.Model):
    # column1: String (CharField)
    column1 = models.CharField(max_length=255, verbose_name="Column 1 Name")
    
    # column2: Integer (IntegerField)
    column2 = models.IntegerField(verbose_name="Column 2 Name")
    
    # column3: Enum (CharField with choices)
    column3 = models.CharField(
        max_length=10,
        choices=Column3Type.choices,
        default=Column3Type.OPTION_A,
        verbose_name="Column 3 Name"
    )

    class Meta:
        verbose_name = "Table Name"
        verbose_name_plural = "Table Names"
        ordering = ['column1'] # Default sorting

    def __str__(self):
        return f"{self.column1} ({self.get_column3_display()})"
```
*Note: Django automatically adds an `id` primary key. You do not need to define it unless you have a specific reason to override it.*

---

## Step 3: Register the App in Settings 🚨 **(MOST COMMON MISTAKE)**
If you created a **new app** in Step 1, Django will ignore it until you explicitly register it.

You must add your app name to `INSTALLED_APPS` in **two places**:
1. **`remolab/settings.template`** — ensures any new clone or future container initialization includes your app.
2. **`remolab/remolab/settings.py`** — ensures your currently running project recognizes the app immediately.

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Local apps
    'organizations',
    '<app_name>',  # <-- ADD YOUR NEW APP HERE (e.g., 'billing')
]
```

> ⚠️ **Important:** Because Uvicorn loads `settings.py` into memory when starting, you must restart the `web` container after updating settings:
> ```bash
> docker compose restart web
> ```

---

## Step 4: Register in Django Admin (Recommended)
To allow staff to view and manage this data via the Django Admin panel, register the model.

Open `remolab/<app_name>/admin.py`:
```python
from django.contrib import admin
from .models import TableName

@admin.register(TableName)
class TableNameAdmin(admin.ModelAdmin):
    list_display = ('column1', 'column2', 'column3')
    list_filter = ('column3',)
    search_fields = ('column1',)
```

---

## Step 5: Generate and Apply Migrations
Now, tell Django to translate your Python model into a PostgreSQL database schema. Run these two commands from your host machine's `backend/` directory:

```bash
# 1. Generate the migration file (creates a Python file in the app's migrations/ folder)
docker exec -it remolab_web python manage.py makemigrations <app_name>

# 2. Apply the migration to the actual PostgreSQL database
docker exec -it remolab_web python manage.py migrate
```

**Expected Output:**
```text
Migrations for '<app_name>':
  <app_name>/migrations/0001_initial.py
    + Create model TableName
Operations to perform:
  Apply all migrations: <app_name>
Running migrations:
  Applying <app_name>.0001_initial... OK
```

---

## Step 6: Create a Superuser (If not already done)
To verify your new table in the Django Admin panel, you need an admin account. Django does not create one by default for security reasons.

Run this command from your host machine:
```bash
docker exec -it remolab_web python manage.py createsuperuser
```

Follow the interactive prompts:
```text
Username (leave blank to use 'root'): admin
Email address: admin@remolab.com
Password: 
Password (again): 
Superuser created successfully.
```
> 💡 **Note:** When typing the password, **nothing will show up on the screen**. This is a standard Linux security feature. Just type it carefully and press Enter.

---

## Step 7: Verify in the Admin Panel
1. Open your browser and go to:
   - Via Nginx (Reverse Proxy): **http://localhost/admin/**
   - Directly via Django: **http://localhost:8000/admin/**
2. Log in with the `Username` and `Password` you just created.
3. Verify that your new table (e.g., "Table Names") appears in the dashboard and that you can add/edit records.

---

## Step 8: Verify Directly in PostgreSQL (Terminal)
From the host machine's `backend/` directory (where `.secrets/` is located), list all database tables to confirm the table exists in PostgreSQL:

```bash
docker exec -it remolab_db psql -U $(cat .secrets/db_user.txt) -d $(cat .secrets/db_name.txt) -c "\dt"
```

Look for `<app_name>_<tablename>` in the output relations table.

---

## 🛑 Common Pitfalls & Troubleshooting

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| `No installed app with label '<app_name>'` | You forgot **Step 3**. | Add the app to `INSTALLED_APPS` in both `settings.template` and `remolab/settings.py`, then run `makemigrations` again. |
| Table missing from Django Admin | Uvicorn hasn't reloaded `settings.py` or model wasn't registered in `admin.py`. | Run `docker compose restart web` and check `admin.py`. |
| `CommandError: Conflicting migrations detected` | Multiple migrations were created with divergent histories. | Run `docker exec -it remolab_web python manage.py makemigrations --merge` |
| Cannot log into `/admin/` | No superuser exists or password is forgotten. | Run `docker exec -it remolab_web python manage.py createsuperuser` (or `changepassword <username>`). |
| Changes to `models.py` don't reflect | Docker didn't sync the host file. | Ensure your `docker-compose.yml` has `- ./remolab:/app` in the `web` service volumes. |
```