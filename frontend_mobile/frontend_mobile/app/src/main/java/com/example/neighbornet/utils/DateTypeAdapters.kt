package com.example.neighbornet.utils

import com.google.gson.*
import java.lang.reflect.Type
import java.time.LocalDateTime

data class ArrayDate(
    val values: List<Int>
) {
    companion object {
        fun fromString(dateString: String): ArrayDate {
            val dt = LocalDateTime.parse(dateString)
            return ArrayDate(listOf(dt.year, dt.monthValue, dt.dayOfMonth,
                dt.hour, dt.minute, dt.second, dt.nano))
        }
    }
}


data class StringDate(
    val value: String
)

class ArrayDateAdapter : JsonDeserializer<ArrayDate>, JsonSerializer<ArrayDate> {
    override fun deserialize(json: JsonElement, typeOfT: Type, context: JsonDeserializationContext): ArrayDate {
        return when {
            json.isJsonArray -> {
                val array = json.asJsonArray
                ArrayDate(array.map { it.asInt })
            }
            json.isJsonPrimitive -> {
                ArrayDate.fromString(json.asString)
            }
            else -> throw JsonParseException("Unexpected date format")
        }
    }

    override fun serialize(src: ArrayDate, typeOfSrc: Type, context: JsonSerializationContext): JsonElement {
        val array = JsonArray()
        src.values.forEach { array.add(it) }
        return array
    }
}


class StringDateAdapter : JsonDeserializer<StringDate>, JsonSerializer<StringDate> {
    override fun deserialize(json: JsonElement, typeOfT: Type, context: JsonDeserializationContext): StringDate {
        return when {
            json.isJsonPrimitive -> StringDate(json.asString)
            json.isJsonArray -> {
                val array = json.asJsonArray
                val dt = LocalDateTime.of(
                    array[0].asInt,
                    array[1].asInt,
                    array[2].asInt,
                    array[3].asInt,
                    array[4].asInt,
                    array[5].asInt,
                    if (array.size() > 6) array[6].asInt else 0
                )
                StringDate(dt.toString())
            }
            else -> throw JsonParseException("Unexpected date format")
        }
    }

    override fun serialize(src: StringDate, typeOfSrc: Type, context: JsonSerializationContext): JsonElement {
        return JsonPrimitive(src.value)
    }
}