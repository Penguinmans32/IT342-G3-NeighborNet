package com.example.neighbornet.utils

import kotlinx.serialization.KSerializer
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.builtins.serializer
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.descriptors.buildClassSerialDescriptor
import kotlinx.serialization.encoding.*
import java.time.LocalDate
import java.time.LocalDateTime

object LocalDateArraySerializer : KSerializer<LocalDate> {
    override val descriptor: SerialDescriptor = buildClassSerialDescriptor("LocalDate")

    override fun serialize(encoder: Encoder, value: LocalDate) {
        encoder.encodeString(value.toString())
    }

    override fun deserialize(decoder: Decoder): LocalDate {
        val array = decoder.decodeSerializableValue(ListSerializer(Int.serializer()))
        return LocalDate.of(array[0], array[1], array[2])
    }
}

object LocalDateTimeArraySerializer : KSerializer<LocalDateTime> {
    override val descriptor: SerialDescriptor = buildClassSerialDescriptor("LocalDateTime")

    override fun serialize(encoder: Encoder, value: LocalDateTime) {
        encoder.encodeString(value.toString())
    }

    override fun deserialize(decoder: Decoder): LocalDateTime {
        val array = decoder.decodeSerializableValue(ListSerializer(Int.serializer()))
        return LocalDateTime.of(array[0], array[1], array[2], array[3], array[4], array[5], array[6])
    }
}