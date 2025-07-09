from marshmallow import Schema, fields, validate, validates, ValidationError
import re

class RegisterSchema(Schema):
    username = fields.Str(
        required=True,
        validate=[
            validate.Length(min=3, max=50, error="Username deve ter entre 3 e 50 caracteres"),
            validate.Regexp(
                r'^[a-zA-Z0-9_]+$',
                error="Username deve conter apenas letras, números e underscore"
            )
        ]
    )
    email = fields.Email(
        required=True,
        validate=validate.Length(max=100, error="Email deve ter no máximo 100 caracteres")
    )
    password = fields.Str(
        required=True,
        validate=[
            validate.Length(min=6, max=128, error="Senha deve ter entre 6 e 128 caracteres")
        ]
    )
    confirm_password = fields.Str(required=True)

    @validates('password')
    def validate_password_strength(self, value):
        """Validação adicional de força da senha"""
        if len(value) < 6:
            raise ValidationError("Senha deve ter pelo menos 6 caracteres")
        
        # Opcional: validações mais rigorosas
        # if not re.search(r'[A-Z]', value):
        #     raise ValidationError("Senha deve conter pelo menos uma letra maiúscula")
        # if not re.search(r'[a-z]', value):
        #     raise ValidationError("Senha deve conter pelo menos uma letra minúscula")
        # if not re.search(r'\d', value):
        #     raise ValidationError("Senha deve conter pelo menos um número")

    def validate_passwords_match(self, data, **kwargs):
        """Valida se as senhas coincidem"""
        if data.get('password') != data.get('confirm_password'):
            raise ValidationError({'confirm_password': ['Senhas não coincidem']})


class LoginSchema(Schema):
    username = fields.Str(
        required=True,
        validate=validate.Length(min=1, error="Username/Email é obrigatório")
    )
    password = fields.Str(
        required=True,
        validate=validate.Length(min=1, error="Senha é obrigatória")
    )
    remember_me = fields.Bool(load_default=False)


class RefreshTokenSchema(Schema):
    refresh_token = fields.Str(required=True)


class ChangePasswordSchema(Schema):
    current_password = fields.Str(required=True)
    new_password = fields.Str(
        required=True,
        validate=[
            validate.Length(min=6, max=128, error="Nova senha deve ter entre 6 e 128 caracteres")
        ]
    )
    confirm_new_password = fields.Str(required=True)

    @validates('new_password')
    def validate_new_password_strength(self, value):
        """Validação de força da nova senha"""
        if len(value) < 6:
            raise ValidationError("Nova senha deve ter pelo menos 6 caracteres")

    def validate_new_passwords_match(self, data, **kwargs):
        """Valida se as novas senhas coincidem"""
        if data.get('new_password') != data.get('confirm_new_password'):
            raise ValidationError({'confirm_new_password': ['Novas senhas não coincidem']})


# Schemas de resposta
class UserResponseSchema(Schema):
    id = fields.Int()
    username = fields.Str()
    email = fields.Email()
    created_at = fields.DateTime()
    is_active = fields.Bool()


class LoginResponseSchema(Schema):
    access_token = fields.Str()
    refresh_token = fields.Str()
    user = fields.Nested(UserResponseSchema)
    expires_in = fields.Int()


class MessageResponseSchema(Schema):
    message = fields.Str()
    success = fields.Bool()


class ErrorResponseSchema(Schema):
    error = fields.Str()
    message = fields.Str()
    details = fields.Dict(load_default=None)

