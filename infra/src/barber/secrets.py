"""
Secrets from Systems Manager Parameter Store.

The Resend key and the dashboard credentials are SecureString parameters
under /barber/<stage>/. They are read once per cold start and cached for the
life of the instance. Nothing secret appears in the template, the repo or
an environment variable: the template passes only the parameter names.

Decryption needs no KMS permission of its own because the parameters use the
account's default aws/ssm key, whose policy lets Parameter Store decrypt for
any caller allowed to read the parameter.
"""

from __future__ import annotations

from typing import Optional

import boto3

_cache: dict[str, Optional[str]] = {}
_client = None


def _ssm():
    global _client
    if _client is None:
        _client = boto3.client("ssm")
    return _client


def read_parameter(name: str) -> Optional[str]:
    """Returns the decrypted value, or None when the parameter does not exist.
    A missing parameter is a configuration state the handlers know how to
    answer, not an exception."""
    if name in _cache:
        return _cache[name]

    client = _ssm()
    try:
        value: Optional[str] = client.get_parameter(Name=name, WithDecryption=True)[
            "Parameter"
        ]["Value"]
    except client.exceptions.ParameterNotFound:
        value = None

    _cache[name] = value
    return value


def reset() -> None:
    """Test seam. Drops the cache and the client so a test can swap the
    parameters out from under a handler."""
    global _client
    _cache.clear()
    _client = None
