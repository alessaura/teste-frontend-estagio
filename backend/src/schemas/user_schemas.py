from marshmallow import Schema, fields, validate, validates, ValidationError

class UpdateProfileSchema(Schema):
    username = fields.Str(
        validate=[
            validate.Length(min=3, max=50, error="Username deve ter entre 3 e 50 caracteres"),
            validate.Regexp(
                r'^[a-zA-Z0-9_]+$',
                error="Username deve conter apenas letras, números e underscore"
            )
        ]
    )
    email = fields.Email(
        validate=validate.Length(max=100, error="Email deve ter no máximo 100 caracteres")
    )


class UpdatePreferencesSchema(Schema):
    theme = fields.Str(
        validate=validate.OneOf(
            ['light', 'dark', 'auto'],
            error="Tema deve ser 'light', 'dark' ou 'auto'"
        )
    )
    notifications_enabled = fields.Bool()
    remember_me = fields.Bool()


class UserStatsSchema(Schema):
    total_logins = fields.Int()
    last_login = fields.DateTime(allow_none=True)
    account_age_days = fields.Int()
    sessions_count = fields.Int()


class UserProfileResponseSchema(Schema):
    id = fields.Int()
    username = fields.Str()
    email = fields.Email()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()
    is_active = fields.Bool()
    preferences = fields.Nested('UserPreferencesResponseSchema')
    stats = fields.Nested(UserStatsSchema)


class UserPreferencesResponseSchema(Schema):
    theme = fields.Str()
    notifications_enabled = fields.Bool()
    remember_me = fields.Bool()
    updated_at = fields.DateTime()


class DeleteAccountSchema(Schema):
    password = fields.Str(required=True)
    confirmation = fields.Str(
        required=True,
        validate=validate.Equal('DELETE', error="Digite 'DELETE' para confirmar")
    )

