pub fn maybe<S,F>(result: Result<S, F>) -> Result<S, String> where F: std::fmt::Display {
    return match result {
        Ok(success) => Ok(success),
        Err(err) => Err(format!("{:?}", err.to_string()))
    }
}

pub fn maybe_ref<S,F>(result: &Result<S, F>) -> Result<&S, String> where F: std::fmt::Display {
    return match result {
        Ok(success) => Ok(success),
        Err(err) => Err(format!("{:?}", err.to_string()))
    }
}
