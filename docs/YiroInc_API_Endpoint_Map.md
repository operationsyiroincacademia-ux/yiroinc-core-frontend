# YiroInc Core API Endpoint Map

**Base URL:** `https://yiroincacademia.com/wp-json/yac/v1`

This document reflects the REST routes currently registered by the YiroInc Core WordPress plugin.

## Authentication

Protected routes require:

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

For file uploads, use `multipart/form-data` instead of JSON.

### Access Levels

* **Public:** No Bearer token required.
* **Authenticated:** Valid Bearer JWT required.
* **Admin:** Valid Bearer JWT plus WordPress `manage_options` capability.

### Standard Response Format

Successful JSON handlers use:

```json
{
  "success": true,
  "data": {}
}
```

Errors use:

```json
{
  "success": false,
  "message": "Error message"
}
```

The protected file-download endpoint is an exception and returns the raw file rather than the standard JSON wrapper.

---

## Auth

| Method | Endpoint         | Access        | Handler      | Main Success Data          |
| ------ | ---------------- | ------------- | ------------ | -------------------------- |
| `POST` | `/auth/register` | Public        | `register()` | `token`, `user`, `profile` |
| `POST` | `/auth/login`    | Public        | `login()`    | `token`, `user`, `profile` |
| `GET`  | `/auth/me`       | Authenticated | `me()`       | `user`, `profile`          |
| `POST` | `/auth/logout`   | Authenticated | `logout()`   | `message`                  |

---

## Products

| Method | Endpoint         | Access        | Handler          | Main Success Data          |
| ------ | ---------------- | ------------- | ---------------- | -------------------------- |
| `GET`  | `/products`      | Authenticated | `get_products()` | `products[]`, `pagination` |
| `GET`  | `/products/{id}` | Authenticated | `get_product()`  | `product`                  |

### Product Fields

`format_product()` currently returns:

```text
id
name
slug
sku
type
short_description
description
price
regular_price
sale_price
currency
image
```

---

## Settings

### Bank Account

| Method           | Endpoint                 | Access        | Handler                 | Main Success Data |
| ---------------- | ------------------------ | ------------- | ----------------------- | ----------------- |
| `GET`            | `/settings/bank-account` | Authenticated | `get_bank_account()`    | `bank_account`    |
| `POST/PUT/PATCH` | `/settings/bank-account` | Admin         | `update_bank_account()` | `message`         |

---

## Orders

| Method           | Endpoint                | Access        | Handler                 | Main Success Data                                         |
| ---------------- | ----------------------- | ------------- | ----------------------- | --------------------------------------------------------- |
| `POST`           | `/orders`               | Authenticated | `create_order()`        | `order_id`, `order_reference`, `total_amount`, `currency` |
| `GET`            | `/orders`               | Authenticated | `get_orders()`          | `orders[]`                                                |
| `GET`            | `/orders/{id}`          | Authenticated | `get_order()`           | `order`                                                   |
| `POST/PUT/PATCH` | `/orders/{id}/status`   | Admin         | `update_order_status()` | `message`                                                 |
| `POST/PUT/PATCH` | `/orders/{id}/dispatch` | Admin         | `dispatch_order()`      | `message`                                                 |
| `POST/PUT/PATCH` | `/orders/{id}/fulfil`   | Admin         | `fulfil_order()`        | `message`                                                 |

---

## Payments

| Method           | Endpoint                | Access        | Handler            | Main Success Data                                                        |
| ---------------- | ----------------------- | ------------- | ------------------ | ------------------------------------------------------------------------ |
| `POST`           | `/payments`             | Authenticated | `create_payment()` | `payment_id`, `order_id`, `payment_reference`, `amount_paid`, `currency` |
| `GET`            | `/payments`             | Authenticated | `get_payments()`   | `payments[]`, `pagination`                                               |
| `GET`            | `/payments/{id}`        | Authenticated | `get_payment()`    | `payment`                                                                |
| `POST/PUT/PATCH` | `/payments/{id}/verify` | Admin         | `verify_payment()` | `message`                                                                |
| `POST/PUT/PATCH` | `/payments/{id}/reject` | Admin         | `reject_payment()` | `message`                                                                |

---

## Files

| Method | Endpoint               | Access        | Handler           | Main Success Data                                                                                 |
| ------ | ---------------------- | ------------- | ----------------- | ------------------------------------------------------------------------------------------------- |
| `POST` | `/files/upload`        | Authenticated | `upload_file()`   | `file_id`, `related_type`, `related_id`, `file_type`, `payment_status`, `order_status`, `message` |
| `GET`  | `/files/{id}/download` | Authenticated | `download_file()` | Raw file response                                                                                 |

### File Notes

* Uploads use `multipart/form-data`.
* Private files are downloaded through `/files/{id}/download`.
* The Bearer token is required for protected downloads.
* `/files/{id}/download` returns the actual file through HTTP headers/file output, not JSON.
* There is currently no general `/files` listing endpoint registered.

---

## Profiles

| Method           | Endpoint    | Access        | Handler            | Main Success Data |
| ---------------- | ----------- | ------------- | ------------------ | ----------------- |
| `POST`           | `/profiles` | Authenticated | `create_profile()` | `profile_id`      |
| `GET`            | `/profiles` | Authenticated | `get_profile()`    | `profile`         |
| `POST/PUT/PATCH` | `/profiles` | Authenticated | `update_profile()` | `message`         |

### Profile Fields Returned by `GET /profiles`

```text
id
user_id
profile_type
phone
organization_name
exam_type
exam_level
institution
area_of_interest
country
created_at
updated_at
```

### Editable Profile Fields

`PATCH /profiles` supports partial updates.

Accepted fields:

```text
phone
organization_name
exam_type
exam_level
institution
area_of_interest
country
```

All accepted fields are optional and nullable.

### Protected Profile Fields

The following fields cannot be updated through `/profiles`:

```text
id
user_id
profile_type
created_at
updated_at
email
name
first_name
last_name
```

Name and email remain account identity fields and are not editable through `/profiles`.

`phone` is editable and is stored on the profile.

Unknown fields are ignored.

If a PATCH request contains no valid editable fields, the endpoint returns `400` with:

```json
{
  "success": false,
  "message": "No valid profile fields provided."
}
```

### Example PATCH Request

```json
{
  "phone": "+234 801 234 5678",
  "institution": "University of Lagos"
}
```

### Example Successful PATCH Response

```json
{
  "success": true,
  "data": {
    "message": "Profile updated successfully."
  }
}
```

---

## Tutor Requests

| Method           | Endpoint                        | Access        | Handler              | Main Success Data          |
| ---------------- | ------------------------------- | ------------- | -------------------- | -------------------------- |
| `POST`           | `/tutor-requests`               | Authenticated | `create_request()`   | `request_id`               |
| `GET`            | `/tutor-requests`               | Authenticated | `get_requests()`     | `requests[]`, `pagination` |
| `GET`            | `/tutor-requests/{id}`          | Authenticated | `get_request()`      | `request`                  |
| `POST/PUT/PATCH` | `/tutor-requests/{id}/match`    | Admin         | `match_tutor()`      | `message`                  |
| `POST/PUT/PATCH` | `/tutor-requests/{id}/start`    | Admin         | `start_session()`    | `message`                  |
| `POST/PUT/PATCH` | `/tutor-requests/{id}/complete` | Admin         | `complete_session()` | `message`                  |

---

## Consulting Requests

| Method           | Endpoint                             | Access        | Handler                 | Main Success Data          |
| ---------------- | ------------------------------------ | ------------- | ----------------------- | -------------------------- |
| `POST`           | `/consulting-requests`               | Authenticated | `create_request()`      | `request_id`               |
| `GET`            | `/consulting-requests`               | Authenticated | `get_requests()`        | `requests[]`, `pagination` |
| `GET`            | `/consulting-requests/{id}`          | Authenticated | `get_request()`         | `request`                  |
| `POST/PUT/PATCH` | `/consulting-requests/{id}/assign`   | Admin         | `assign_consultant()`   | `message`                  |
| `POST/PUT/PATCH` | `/consulting-requests/{id}/start`    | Admin         | `start_consulting()`    | `message`                  |
| `POST/PUT/PATCH` | `/consulting-requests/{id}/complete` | Admin         | `complete_consulting()` | `message`                  |

---

## Procurements

| Method           | Endpoint                       | Access        | Handler                | Main Success Data              |
| ---------------- | ------------------------------ | ------------- | ---------------------- | ------------------------------ |
| `POST`           | `/procurements`                | Authenticated | `create_procurement()` | `procurement_id`               |
| `GET`            | `/procurements`                | Authenticated | `get_procurements()`   | `procurements[]`, `pagination` |
| `GET`            | `/procurements/{id}`           | Authenticated | `get_procurement()`    | `procurement`                  |
| `POST/PUT/PATCH` | `/procurements/{id}/ordered`   | Admin         | `mark_ordered()`       | `message`                      |
| `POST/PUT/PATCH` | `/procurements/{id}/shipped`   | Admin         | `mark_shipped()`       | `message`                      |
| `POST/PUT/PATCH` | `/procurements/{id}/delivered` | Admin         | `mark_delivered()`     | `message`                      |

---

## Resources

Resources are platform content created by YiroInc administrators and made available to authenticated users based on resource visibility and targeting rules.

A resource can be either:

- an uploaded protected file
- an external URL

### Resource Endpoints

| Method | Endpoint | Access | Handler | Main Success Data |
|---|---|---|---|---|
| `POST` | `/resources` | Admin | `create_resource()` | `resource_id` |
| `GET` | `/resources` | Authenticated | `get_resources()` | `resources[]` |
| `GET` | `/resources/{id}` | Authenticated | `get_resource()` | `resource` |

---

### Resource Fields Returned

`GET /resources` and `GET /resources/{id}` return the same resource structure.

```text
id
title
description
category
source_type
file_id
file_name
file_format
mime_type
file_size
external_url
profile_type
exam_type
is_public
created_at
updated_at
```

Example file resource:

```json
{
  "id": 1,
  "title": "CFA Level 1 Study Guide",
  "description": "Introductory study material.",
  "category": "study-guide",
  "source_type": "file",
  "file_id": 12,
  "file_name": "guide.pdf",
  "file_format": "PDF",
  "mime_type": "application/pdf",
  "file_size": 204800,
  "external_url": null,
  "profile_type": "cfa_candidate",
  "exam_type": "CFA",
  "is_public": 0,
  "created_at": "2026-08-17 10:15:00",
  "updated_at": "2026-08-17 10:15:00"
}
```

---

### Resource Source Types

`source_type` determines how the resource is accessed.

Supported values:

```text
file
external
```

#### File Resource

A file resource uses:

```text
source_type = file
```

and requires a valid `file_id` referencing a Resource file uploaded through `/files/upload`.

#### External Resource

An external resource uses:

```text
source_type = external
```

and requires a valid `external_url`.

A Resource cannot simultaneously use both a file and an external URL.

---

### Create Resource

`POST /resources` is admin-only.

Accepted JSON fields:

| Field | Required | Notes |
|---|---|---|
| `title` | Yes | Maximum 255 characters |
| `source_type` | Yes | Must be `file` or `external` |
| `description` | No | Nullable |
| `category` | No | Nullable, maximum 100 characters |
| `file_id` | Conditional | Required when `source_type=file`; forbidden for external resources |
| `external_url` | Conditional | Required when `source_type=external`; forbidden for file resources |
| `profile_type` | Conditional | Required for non-public resources |
| `exam_type` | No | Can only be used when `profile_type` is provided |
| `is_public` | No | Stored as boolean-like `1` or `0` |

Supported `profile_type` values:

```text
academic_user
exam_candidate
corporate_client
cfa_candidate
frm_candidate
consulting_lead
```

Unsupported profile types are rejected.

---

### Example File Resource Creation

A Resource file must first be uploaded through `/files/upload`.

After receiving the resulting `file_id`, create the Resource:

```json
{
  "title": "CFA Level 1 Study Guide",
  "description": "Introductory study material.",
  "category": "study-guide",
  "source_type": "file",
  "file_id": 42,
  "profile_type": "cfa_candidate",
  "exam_type": "CFA",
  "is_public": false
}
```

The backend validates that the referenced file:

- exists
- has `related_type=resource`
- has `file_type=resource_file`
- has not already been linked to another Resource

After successful Resource creation, the uploaded file is linked to the newly created Resource.

---

### Example External Resource Creation

```json
{
  "title": "CFA Institute Curriculum",
  "description": "External curriculum page.",
  "category": "external-link",
  "source_type": "external",
  "external_url": "https://www.cfainstitute.org/",
  "is_public": true
}
```

External resources do not use `file_id`.

---

### Resource File Upload

Resource files use the existing:

```text
POST /files/upload
```

Access: **Admin only for Resource uploads**

Content type:

```text
multipart/form-data
```

Required fields:

```text
file
related_type = resource
file_type = resource_file
```

`related_id` is optional during the initial upload and will normally be omitted or sent as `0`.

Example:

```text
file: <uploaded file>
related_type: resource
file_type: resource_file
```

The upload response includes:

```text
file_id
related_type
related_id
file_type
file_name
original_name
mime_type
file_size
```

Resource uploads support permitted document, image and video formats up to **50 MB**.

This does not change the existing payment-proof upload rules.

---

### Resource File Download

Protected Resource files are downloaded using:

```text
GET /files/{id}/download
```

where `{id}` is the Resource's `file_id`.

The request requires Bearer JWT authentication.

Resource file downloads use Resource visibility rules rather than ordinary file ownership alone.

An authenticated non-owner may download a Resource file only when the associated Resource is accessible to that user.

Payment-proof file ownership rules remain unchanged.

---

### Resource Visibility

Admins can access all Resources.

For normal authenticated users:

#### Public Resource

When:

```text
is_public = 1
```

the Resource is available to all authenticated users.

#### Targeted Resource

When:

```text
is_public = 0
```

the user's `profile_type` must match the Resource's `profile_type`.

If the Resource also contains an `exam_type`, the user's stored `exam_type` must match it.

Example:

```text
Resource:
profile_type = cfa_candidate
exam_type = CFA

User:
profile_type = cfa_candidate
exam_type = CFA
```

The user can access the Resource.

The same visibility rules apply to:

```text
GET /resources
GET /resources/{id}
GET /files/{file_id}/download
```

Therefore, users cannot bypass Resource visibility by directly requesting a Resource ID or file ID.

`exam_type` matching currently uses exact string matching.

---

### Legacy Resources

Resources created before database version `1.0.2` may not contain a valid file association.

Legacy rows where:

```text
source_type = file
file_id = NULL
```

are not exposed to normal authenticated users as valid downloadable Resources.

Admins may still see these records for administrative/cleanup purposes.

---

### Current Resource Limitations

There are currently no Resource update or delete endpoints.

The backend currently supports:

```text
Create
List
View
Upload file
Download file
External link
Visibility/targeting
```

Resource editing and deletion will require additional endpoints when the Resource management section of the Admin frontend is implemented.

`exam_type` currently uses exact string matching. The future Admin UI should preferably use controlled exam-type options rather than arbitrary free-text values.

---

## Notifications

| Method           | Endpoint                      | Access        | Handler                  | Main Success Data               |
| ---------------- | ----------------------------- | ------------- | ------------------------ | ------------------------------- |
| `GET`            | `/notifications`              | Authenticated | `get_notifications()`    | `notifications[]`, `pagination` |
| `GET`            | `/notifications/{id}`         | Authenticated | `get_notification()`     | `notification`                  |
| `GET`            | `/notifications/unread-count` | Authenticated | `get_unread_count()`     | `count`                         |
| `POST/PUT/PATCH` | `/notifications/read-all`     | Authenticated | `mark_all_as_read()`     | `message`                       |
| `POST/PUT/PATCH` | `/notifications/{id}/read`    | Authenticated | `mark_as_read()`         | `message`                       |
| `POST/PUT/PATCH` | `/notifications/{id}/dismiss` | Authenticated | `dismiss_notification()` | `message`                       |

---

## Timeline

| Method | Endpoint         | Access        | Handler          | Main Success Data |
| ------ | ---------------- | ------------- | ---------------- | ----------------- |
| `POST` | `/timeline`      | Admin         | `create_event()` | `event_id`        |
| `GET`  | `/timeline`      | Authenticated | `get_events()`   | `events[]`        |
| `GET`  | `/timeline/{id}` | Authenticated | `get_event()`    | `event`           |

---

## Dashboards

| Method | Endpoint               | Access        | Handler                 | Main Success Data                                                                      |
| ------ | ---------------------- | ------------- | ----------------------- | -------------------------------------------------------------------------------------- |
| `GET`  | `/dashboard/general`   | Authenticated | `general_dashboard()`   | `profile`, `resources`, `notifications`, `timeline`                                    |
| `GET`  | `/dashboard/exam`      | Authenticated | `exam_dashboard()`      | `profile`, `payments`, `procurements`, `resources`, `notifications`, `timeline`        |
| `GET`  | `/dashboard/corporate` | Authenticated | `corporate_dashboard()` | `profile`, `consulting_requests`, `payments`, `resources`, `notifications`, `timeline` |
| `GET`  | `/dashboard/admin`     | Admin         | `admin_dashboard()`     | `summary`, `recent_activity`, `pending_*`                                              |

---

## Admin

| Method | Endpoint                     | Access | Handler                 | Main Success Data       |
| ------ | ---------------------------- | ------ | ----------------------- | ----------------------- |
| `GET`  | `/admin/dashboard`           | Admin  | `dashboard()`           | `dashboard`             |
| `GET`  | `/admin/activity`            | Admin  | `activity()`            | `activity`              |
| `GET`  | `/admin/payments`            | Admin  | `payments()`            | `payments[]`            |
| `GET`  | `/admin/procurements`        | Admin  | `procurements()`        | `procurements[]`        |
| `GET`  | `/admin/tutor-requests`      | Admin  | `tutor_requests()`      | `tutor_requests[]`      |
| `GET`  | `/admin/consulting-requests` | Admin  | `consulting_requests()` | `consulting_requests[]` |

---

## Admin Invitations

| Method | Endpoint                    | Access | Handler               | Main Success Data                                 |
| ------ | --------------------------- | ------ | --------------------- | ------------------------------------------------- |
| `POST` | `/admin-invitations`        | Admin  | `create_invitation()` | `invitation_id`, `invitation_token`, `expires_at` |
| `POST` | `/admin-invitations/accept` | Public | `accept_invitation()` | `user_id`, `email`                                |

---

## Audit Logs

| Method | Endpoint           | Access | Handler      | Main Success Data      |
| ------ | ------------------ | ------ | ------------ | ---------------------- |
| `GET`  | `/audit-logs`      | Admin  | `get_logs()` | `logs[]`, `pagination` |
| `GET`  | `/audit-logs/{id}` | Admin  | `get_log()`  | `log`                  |

---

## Search

| Method | Endpoint  | Access | Handler    | Main Success Data                                                                                  |
| ------ | --------- | ------ | ---------- | -------------------------------------------------------------------------------------------------- |
| `GET`  | `/search` | Admin  | `search()` | `query`, `users`, `payments`, `procurements`, `tutor_requests`, `consulting_requests`, `resources` |

---

## Frontend Integration Notes

* Store the JWT returned by `/auth/login` or `/auth/register`.
* Attach the JWT to authenticated requests using `Authorization: Bearer <JWT_TOKEN>`.
* `GET /auth/me` requires authentication and is used to restore or validate the current user.
* `/products` and `/products/{id}` are authenticated endpoints.
* `GET /settings/bank-account` is authenticated.
* Updating `/settings/bank-account` is admin-only.
* File uploads use `multipart/form-data`.
* Protected file downloads use `/files/{id}/download` with the Bearer token.
* There is currently no general file-list endpoint.
* Some authenticated list/read handlers additionally apply ownership filtering internally.
* Admin endpoints require the WordPress `manage_options` capability.
* Routes shown as `POST/PUT/PATCH` are registered using WordPress `WP_REST_Server::EDITABLE`.

---

## Source of Truth

This endpoint map was regenerated from the REST routes registered in the current YiroInc Core WordPress plugin.

The REST namespace is:

```text
yac/v1
```

Full API routes therefore use:

```text
https://yiroincacademia.com/wp-json/yac/v1/...
```

No additional REST endpoints were found outside the plugin's registered `register_rest_route(...)` calls.
